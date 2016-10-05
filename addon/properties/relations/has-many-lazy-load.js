import Ember from 'ember';
import { Errors } from '../../util/error';

const {
  RSVP: { resolve, reject, allSettled },
  run,
  merge
} = Ember;

function splitInternalModelsByDatabase(content) {
  let dbs = new Map();
  content.forEach(internal => {
    if(!internal.shouldLazyLoad(true)) {
      return;
    }
    let db = internal.database;
    let arr = dbs.get(db);
    if(!arr) {
      arr = [];
      dbs.set(db, arr);
    }
    arr.push(internal);
  });
  return dbs;
}

function loadInternalModelsForDatabase(db, arr) {
  let promise = resolve().then(() => {
    return db._reloadInternalModels(arr);
  }).then(() => undefined, err => {
    relation.internal.reportLazyLoadError(`{ database: '${db.get('identifier')}', _ids: [ ${arr.map(internal => `'${internal.docId}'`).join(', ')} ] }`, err);
    return reject(err);
  });
  arr.forEach(internal => internal.setLazyLoadModelPromise(promise));
  return promise;
}

function lazyLoadInternalModels(content) {
  let dbs = splitInternalModelsByDatabase(content);

  let promises = [];
  for(let [db, arr] of dbs) {
    promises.push(loadInternalModelsForDatabase(db, arr));
  }

  return allSettled(promises);
}

function setState(relation, next) {
  let state = relation.lazyLoad;
  let proxy = relation.value;
  proxy.beginPropertyChanges();
  for(let key in next) {
    let value = next[key];
    if(state[key] !== value) {
      state[key] = value;
      proxy.notifyPropertyChange(key);
    }
  }
  proxy.endPropertyChanges();
}

export default function(relation, prop) {
  let state = relation.lazyLoad;

  if(!relation.lazyLoadEnabled) {
    return state[prop];
  }

  if(!state.needs) {
    return state[prop];
  }

  if(state.isLoading) {
    return state[prop];
  }

  merge(state, {
    needs: false,
    isLoading: true,
    isError: false,
    error: null
  });

  let content = relation.content;

  lazyLoadInternalModels(content).then(results => {
    let all = Ember.A(results.map(result => result.reason && result.reason.errors)).compact();
    if(all.length > 0) {
      let error = new Errors(all.reduce((prev, curr) => {
        prev.push(...curr);
        return prev;
      }, []));
      setState(relation, {
        isLoading: false,
        isError: true,
        error
      });
    } else {
      setState(relation, {
        isLoading: false,
        isError: false,
        error: null
      });
    }
  });

  return state[prop];
}

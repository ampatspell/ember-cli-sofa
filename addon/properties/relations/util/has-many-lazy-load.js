import Ember from 'ember';
import { Errors } from '../../../util/error';

const {
  RSVP: { resolve, allSettled },
  Logger: { error }
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

function loadInternalModelsForDatabase(relation, db, arr) {
  let promise = resolve().then(() => {
    return db._reloadInternalModels(arr);
  }).then(() => {
    return { ok: true };
  }, err => {
    relation.internal.reportLazyLoadError(`{ database: '${db.get('identifier')}', _ids: [ ${arr.map(internal => `'${internal.docId}'`).join(', ')} ] }`, err);
    return { ok: false, reason: err };
  });
  arr.forEach(internal => internal.setLazyLoadModelPromise(promise));
  return promise;
}

function lazyLoadInternalModels(relation) {
  let content = relation.content;
  let dbs = splitInternalModelsByDatabase(content);

  let promises = [];
  for(let [db, arr] of dbs) {
    promises.push(loadInternalModelsForDatabase(relation, db, arr));
  }

  return allSettled(promises);
}

function setState(relation, next) {
  relation.lazyLoad = next;
  relation.value.notifyPropertyChange('state');
}

function collectErrors(results) {
  let failed = Ember.A(results).filter(result => !result.value.ok);
  let errors = Ember.A(failed).map(result => result.value.reason.errors || result.value.reason);
  if(errors.length === 0) {
    return;
  }
  return errors.reduce((prev, curr) => {
    prev.push(...curr);
    return prev;
  }, []);
}

export default function(relation) {
  let state = relation.lazyLoad;

  if(!relation.lazyLoadEnabled) {
    return state;
  }

  if(!state.needs) {
    return state;
  }

  if(state.isLoading) {
    return state;
  }

  lazyLoadInternalModels(relation).then(results => {
    let errors = collectErrors(results);
    if(errors) {
      let error = new Errors(errors);
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
  }).catch(err => {
    error(err.stack);
  });

  relation.lazyLoad = {
    needs: false,
    isLoading: true,
    isError: false,
    error: null
  };

  return relation.lazyLoad;
}

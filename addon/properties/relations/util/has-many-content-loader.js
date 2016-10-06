import Ember from 'ember';
import { Errors } from '../../../util/error';
import globalOptions from '../../../util/global-options';

const {
  RSVP: { resolve, allSettled },
  Logger: { error }
} = Ember;

export default class HasManyContentLoader {

  constructor(relation) {
    this.relation = relation;
    this.state = {
      isLoading: false,
      isError: false,
      error: null
    };
    this.needs = true;
  }

  getProxy() {
    return this.relation.value;
  }

  getContent() {
    return this.relation.content;
  }

  setState(next) {
    this.state = next;
    this.getProxy().notifyPropertyChange('state');
  }

  collectErrors(results) {
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

  splitInternalModelsByDatabase(content) {
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

  loadInternalModelsForDatabase(db, arr) {
    let promise = resolve().then(() => {
      return db._reloadInternalModels(arr);
    }).then(() => {
      return { ok: true };
    }, err => {
      this.relation.internal.reportLazyLoadError(`{ database: '${db.get('identifier')}', _ids: [ ${arr.map(internal => `'${internal.docId}'`).join(', ')} ] }`, err);
      return { ok: false, reason: err };
    });
    arr.forEach(internal => internal.setLazyLoadModelPromise(promise));
    return promise;
  }

  lazyLoadInternalModels() {
    let content = this.getContent();
    let dbs = this.splitInternalModelsByDatabase(content);

    let promises = [];
    for(let [db, arr] of dbs) {
      promises.push(this.loadInternalModelsForDatabase(db, arr));
    }

    return allSettled(promises);
  }

  load() {
    let state = this.state;

    if(!globalOptions.autoload.persistedArray) {
      return state;
    }

    if(!this.needs) {
      return state;
    }

    if(this.isLoading) {
      return state;
    }

    this.lazyLoadInternalModels().then(results => {
      let errors = this.collectErrors(results);
      if(errors) {
        let error = new Errors(errors);
        this.setState({
          isLoading: false,
          isError: true,
          error
        });
      } else {
        this.setState({
          isLoading: false,
          isError: false,
          error: null
        });
      }
    }).catch(err => {
      error(err.stack);
    });

    this.needs = false;

    this.state = {
      isLoading: true,
      isError: false,
      error: null
    };

    return this.state;
  }

  getState() {
    return this.load();
  }

  setNeedsLoad() {
    this.needs = true;
  }

}

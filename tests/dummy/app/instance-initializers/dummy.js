import Ember from 'ember';
import { later } from 'sofa/util/run';

const {
  Logger: { info, error }
} = Ember;

export function throttle(db) {
  let documents = db.get('documents');
  let request = documents.request;
  documents.request = (...args) => {
    return later(200).then(() => {
      return request.call(documents, ...args);
    });
  };
}

export default {
  name: 'dummy:develop',
  initialize(app) {
    app.inject('component', 'router', 'service:router');

    let store = app.lookup('service:store');
    store.set('_applicationModulePrefix', 'dummy');

    let main = store.get('db.main');
    // throttle(main);

    window.store = store;
    window.db = main;
    window.log = info;
    window.err = err => error(err.toJSON ? err.toJSON() : err.stack);

    window.set = key => {
      return arg => {
        window[key] = arg;
        info(key, '=', arg+'');
      };
    };
  }
};

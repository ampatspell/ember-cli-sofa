import later from 'sofa/util/later';

function throttle(db) {
  let documents = db.get('documents');
  let request = documents.request;
  documents.request = (...args) => {
    return later(1000).then(() => {
      return request.call(documents, ...args);
    });
  };
}

export default {
  name: 'dummy:develop',
  initialize(app) {
    app.inject('component', 'router', 'service:router');

    let store = app.lookup('service:store');
    store.set('_applicationName', 'dummy');

    let main = store.get('db.main');
    throttle(main);

    window.store = store;
    window.db = main;
    window.log = console.log.bind(console);
    window.set = (key) => {
      return function(arg) {
        window[key] = arg;
        console.log(key, '=', arg+'');
      };
    };
  }
};

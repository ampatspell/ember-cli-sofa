export default {
  name: 'dummy:develop',
  initialize(app) {
    app.inject('component', 'router', 'service:router');

    let store = app.lookup('service:store');
    store.set('_applicationName', 'dummy');
    window.store = store;
    window.db = store.get('db.main');
    window.log = console.log.bind(console);
    window.set = (key) => {
      return function(arg) {
        window[key] = arg;
        console.log(key, '=', arg+'');
      };
    };
  }
};

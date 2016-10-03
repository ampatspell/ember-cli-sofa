export default {
  name: 'dummy:develop',
  initialize(app) {
    let store = app.lookup('service:store');
    window.store = store;
    window.db = store.get('db.main');
    window.db.set('modelNames', [ 'author', 'blog' ]);
    window.log = console.log.bind(console);
    window.set = (key) => {
      return function(arg) {
        window[key] = arg;
        console.log(key, '=', arg+'');
      };
    };
  }
};

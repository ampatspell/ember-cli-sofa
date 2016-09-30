export default {
  name: 'dummy:develop',
  initialize(app) {
    let store = app.lookup('service:store');
    window.store = store;
    window.log = console.log.bind(console);
  }
};

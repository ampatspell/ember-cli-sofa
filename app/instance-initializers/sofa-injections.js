export default {
  name: 'sofa:injections',
  initialize(app) {
    app.inject('controller', 'store', 'service:store');
    app.inject('component', 'store', 'service:store');
    app.inject('route', 'store', 'service:store');
  }
};

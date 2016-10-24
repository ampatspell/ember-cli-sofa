export default {
  name: 'sofa-fastboot-shoebox',
  initialize(app) {
    let store = app.lookup('service:store');
    let shoebox = app.lookup('service:fastboot').get('shoebox');
    shoebox.put('sofa', {
      get docs() {
        return store._createShoebox();
      }
    });
  }
};

export default {
  name: 'sofa-fastboot-shoebox',
  initialize(app) {
    let fastboot = app.lookup('service:fastboot');
    if(!fastboot) {
      return;
    }
    let store = app.lookup('service:store');
    let shoebox = fastboot.get('shoebox');
    shoebox.put('sofa', {
      get docs() {
        return store._createShoebox();
      }
    });
  }
};

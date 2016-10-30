export default {
  name: 'sofa-browser-shoebox',
  initialize(app) {
    let fastboot = app.lookup('service:fastboot');
    if(!fastboot) {
      return;
    }
    let shoebox = shoebox.get('shoebox');
    if(!shoebox) {
      return;
    }
    let object = shoebox.retrieve('sofa');
    if(!object) {
      return;
    }
    let store = app.lookup('service:store');
    store._pushShoebox(object.docs);
  }
};

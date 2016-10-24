export default {
  name: 'sofa-browser-shoebox',
  initialize(app) {
    let shoebox = app.lookup('service:fastboot').get('shoebox');
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

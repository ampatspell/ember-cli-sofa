import environment from '../config/environment';

const {
  sofa: { version }
} = environment;

const key = `ember-cli-sofa-${version}`.replace(/\./g, '-');

export default {
  name: 'sofa:shoebox',
  after: 'sofa:injections',
  initialize(app) {
    let fastboot = app.lookup('service:fastboot');
    if(!fastboot) {
      return;
    }

    let shoebox = fastboot.get('shoebox');
    if(!shoebox) {
      return;
    }

    let store = app.lookup('service:store');

    if(fastboot.get('isFastBoot')) {
      shoebox.put(key, {
        get docs() {
          return store._createShoebox();
        }
      });
    } else {
      let object = shoebox.retrieve(key);
      if(!object) {
        return;
      }
      store._pushShoebox(object.docs);
    }
  }
};

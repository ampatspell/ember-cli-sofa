import Ember from 'ember';
import { object } from '../computed';

const {
  getOwner
} = Ember;

export default Ember.Object.extend({

  openCouches: object().readOnly(),

  createCouch(url) {
    return getOwner(this).lookup('couch:main').create({ url });
  },

  couch({ url }) {
    let open = this.get('openCouches');
    let couch = open[url];
    if(!couch) {
      couch = this.createCouch(url);
      open[url] = couch;
    }
    return couch;
  }

});

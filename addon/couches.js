import Ember from 'ember';
import { lookup, object } from './util/computed';

const {
  getOwner
} = Ember;

const couches = () => {
  return lookup('couch:couches');
};

export default Ember.Object.extend({

  _couches: couches(),
  openCouches: object(),

  createCouch(url) {
    let documents = this.get('_couches').couch(url);
    return getOwner(this).lookup('sofa:couch').create({ documents });
  },

  couch(url) {
    let cache = this.get('openCouches');
    let couch = cache[url];
    if(!couch) {
      couch = this.createCouch(url);
      cache[url] = couch;
    }
    return couch;
  }

});

import Ember from 'ember';
import { lookup, object } from './util/computed';
import { destroyObject } from './util/destroy';

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
    return getOwner(this).factoryFor('sofa:couch').create({ documents });
  },

  couch(url) {
    let cache = this.get('openCouches');
    let couch = cache[url];
    if(!couch) {
      couch = this.createCouch(url);
      cache[url] = couch;
    }
    return couch;
  },

  _destroyOpenCouches() {
    destroyObject(this.get('openCouches'));
  },

  willDestroy() {
    this.get('_couches').destroy();
    this._destroyOpenCouches();
    this._super();
  }

});

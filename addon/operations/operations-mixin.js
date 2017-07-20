import Ember from 'ember';
import { lookup } from '../util/computed';

const operations = () => lookup('sofa:operations');

export default Ember.Mixin.create({

  operations: operations(),

  _registerOperation(promise) {
    this.get('operations').register(promise);
    return promise;
  },

  willDestroy() {
    this._super();
    let ops = this.cacheFor('operations');
    if(ops) {
      ops.destroy();
    }
  }

});

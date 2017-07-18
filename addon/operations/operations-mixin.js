import Ember from 'ember';
import { lookup } from '../util/computed';

const operations = () => lookup('sofa:operations');

export default Ember.Mixin.create({

  operations: operations(),

  _registerOperation(name, subject, promise) {
    this.get('operations').register(name, subject, promise);
    return promise;
  },

  _destroyOperations() {
    this.get('operations').destroy();
  }

});

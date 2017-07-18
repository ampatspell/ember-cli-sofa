import Ember from 'ember';
import { lookup } from '../util/computed';

const operations = function() {
  return lookup('sofa:database-operations', function() {
    return { database: this };
  });
};

window.ops = [];

export default Ember.Mixin.create({

  operations: operations(),

  _registerOperation(name, subject, promise) {
    this.get('operations').register(name, subject, promise);
    window.ops.push({ name, subject });
    return promise;
  },

  _destroyOperations() {
    this.get('operations').destroy();
  }

});

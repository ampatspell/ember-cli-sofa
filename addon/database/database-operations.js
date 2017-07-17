import Ember from 'ember';
import { lookup } from '../util/computed';

const operations = function() {
  return lookup('sofa:database-operations', function() {
    return { database: this };
  });
};

export default Ember.Mixin.create({

  operations: operations(),

  _registerOperation(name, subject, promise) {
    this.get('operations').register(name, subject, promise);
    return promise;
  },

  _registerInternalModelOperation(name, subject, promise) {
    return this._registerOperation(`internal-model:${name}`, subject, promise);
  },

  _destroyOperations() {
    this.get('operations').destroy();
  }

});

import Ember from 'ember';
import assert from '../../../util/assert';

export default Ember.Mixin.create({

  _invokeFind(database, opts) {
    return database._internalModelFind(opts).then(hash => {
      assert(`hasMany relationship query find result should always be array not single model`, hash.type === 'array');
      return hash.result;
    });
  }

});

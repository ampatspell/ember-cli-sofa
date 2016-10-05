import Ember from 'ember';

export default Ember.Mixin.create({

  _invokeFind(database, opts) {
    return database._internalModelFirst(opts);
  }

});

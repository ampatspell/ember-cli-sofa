import Ember from 'ember';

export default Ember.Mixin.create({

  willDestroy() {
    this._destroyInternalChangesIdentity();
    this._destroyInternalModelIdentity();
    this._destroySecurity();
    this._destroyOperations();
    this._super();
  }

});

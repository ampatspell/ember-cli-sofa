import Ember from 'ember';

export default Ember.Mixin.create({

  willDestroy() {
    this._destroyInternalChangesIdentity();
    this._destroyInternalModelIdentity();
    this._destroyInternalCollectionIdentity();
    this._destroySecurity();
    this._super();
  }

});

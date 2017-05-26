import Ember from 'ember';

export default Ember.Mixin.create({

  willDestroy() {
    this._destroyInternalModelIdentity();
    this._super();
  }

});

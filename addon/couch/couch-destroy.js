import Ember from 'ember';

export default Ember.Mixin.create({

  willDestroy() {
    this._destroyInternalChangesIdentity();
    this._super();
  }

});

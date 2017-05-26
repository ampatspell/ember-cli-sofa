import Ember from 'ember';

export default Ember.Mixin.create({

  willDestroy() {
    this._destroyDatabases();
    this._super();
  }

});

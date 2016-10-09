import Ember from 'ember';

export default Ember.Mixin.create({

  willDestroy() {
    this._relation.valueWillDestroy();
    this._super();
  }

});

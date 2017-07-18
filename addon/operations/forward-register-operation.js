import Ember from 'ember';

export default name => Ember.Mixin.create({

  _registerOperation() {
    return this.get(name)._registerOperation(...arguments);
  }

});

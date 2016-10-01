import Ember from 'ember';

export default Ember.Mixin.create({

  modelClassForName(modelName) {
    return this.get('store').modelClassForName(modelName);
  }

});

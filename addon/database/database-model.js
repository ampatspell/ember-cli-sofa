import Ember from 'ember';

export default Ember.Mixin.create({

  model(modelName, props) {
    return this.get('store')._createModelForName(modelName, this, props);
  },

  existing(modelName, modelId, opts) {
    let internal = this._existingInternalModel(modelName, modelId, opts);
    if(internal) {
      return internal.getModel();
    }
  },

});

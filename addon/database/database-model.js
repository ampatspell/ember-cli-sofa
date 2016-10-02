import Ember from 'ember';

export default Ember.Mixin.create({

  model(modelName, props) {
    return this.get('store')._createModelForName(modelName, this, props);
  },

  existing(modelName, modelId, opts) {
    let internal = this._existingInternalModelForModelName(modelName, modelId, opts);
    if(internal) {
      return internal.getModel();
    }
  },

  load(modelName, modelId, opts) {
    return this._loadInternalModelForModelName(modelName, modelId, opts).then(internal => {
      return internal.getModel();
    });
  }

});

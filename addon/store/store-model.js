import Ember from 'ember';
import { internalPropertyName } from '../internal-model';

export default Ember.Mixin.create({

  _createModelForInternalModel(internal, modelProps) {
    let modelClass = internal.modelClass;
    let model = modelClass._create({ [internalPropertyName]: internal });
    if(modelProps) {
      model.setProperties(modelProps);
    }
    return model;
  },

  _createModelForName(modelName, database, props) {
    let Model = this.modelClassForName(modelName);
    let internal = this._createNewInternalModel(Model, database, props);
    // TODO: props
    return internal.getModel();
  },

  model(modelName, props) {
    return this._createModelForName(modelName, null, props);
  }

});

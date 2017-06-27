import Ember from 'ember';
import { internalPropertyName } from '../internal-model';

export default Ember.Mixin.create({

  _createModelForInternalModel(internal, props) {
    let Model = internal.modelClass;
    let model = Model.create({ [internalPropertyName]: internal });
    if(props) {
      model.setProperties(props);
    }
    return model;
  },

  _createModelForName(modelName, database, props) {
    let ModelFactory = this.modelClassForName(modelName);
    let { internal, instance } = this._createNewInternalModel(ModelFactory, database, props);
    return internal.getModel(instance);
  },

  model(modelName, props) {
    return this._createModelForName(modelName, null, props);
  }

});

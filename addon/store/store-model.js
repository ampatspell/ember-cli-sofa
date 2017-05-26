import Ember from 'ember';
import { internalPropertyName } from '../internal-model';
import create from '../util/create';

export default Ember.Mixin.create({

  _createModelForInternalModel(internal, props) {
    let modelClass = internal.modelClass;
    let model = create(modelClass, { [internalPropertyName]: internal });
    if(props) {
      model.setProperties(props);
    }
    return model;
  },

  _createModelForName(modelName, database, props) {
    let Model = this.modelClassForName(modelName);
    let { internal, instance } = this._createNewInternalModel(Model, database, props);
    return internal.getModel(instance);
  },

  model(modelName, props) {
    return this._createModelForName(modelName, null, props);
  }

});

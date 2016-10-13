import Ember from 'ember';
import InternalModel from '../internal-model';

export default Ember.Mixin.create({

  _prepareInternalModel(internal, props) {
    let definition = internal.definition;
    let instance = definition.prepareInternalModel(internal, props);
    return { internal, instance };
  },

  // { isNew: true }
  _createNewInternalModel(modelClass, database, props) {
    let internal = new InternalModel(this, modelClass, database);
    return this._prepareInternalModel(internal, props);
  },

  // { isNew: false, isLoaded: true, id }
  _createExistingInternalModel(modelClass, database, modelId) {
    let internal = new InternalModel(this, modelClass, database);
    this._prepareInternalModel(internal, { id: modelId });
    internal.setState({ isNew: false, isDirty: false }, false);
    return internal;
  }

});

import Ember from 'ember';
import InternalModel from '../internal-model';

const {
  merge
} = Ember;

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

  // { isNew: false, isLoaded: false }, id
  _createExistingInternalModel(modelClass, database, modelId) {
    let internal = new InternalModel(this, modelClass, database);
    this._prepareInternalModel(internal, { id: modelId });
    internal.setState({ isNew: false, isDirty: false }, false);
    return internal;
  },

  // { isNew: false, isLoaded: true, isDirty: false }, id, transient=true
  _createTransientInternalModel(modelClass, database, modelId, props) {
    let internal = new InternalModel(this, modelClass, database, true);
    this._prepareInternalModel(internal, merge({ id: modelId }, props));
    internal.setState({ isNew: false, isLoaded: true, isDirty: false }, false);
    return internal;
  }

});

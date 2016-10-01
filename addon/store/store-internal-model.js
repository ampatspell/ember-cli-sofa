import Ember from 'ember';
import InternalModel from '../internal-model';

export default Ember.Mixin.create({

  // { isNew: true }
  _createNewInternalModel(modelClass, database /*, props*/) {
    return new InternalModel(this, modelClass, database);
  },

  // { isNew: false, isLoaded: true }
  _createLoadedInternalModel(modelClass, database, doc) {
    let internal = new InternalModel(this, modelClass, database);
    internal.deserialize(doc, false);
    internal.onLoaded(false);
    return internal;
  }

});

import Ember from 'ember';
import InternalModel from '../internal-model';

export default Ember.Mixin.create({

  // { isNew: true }
  _createNewInternalModel(modelClass, database, props) {
    let internal = new InternalModel(this, modelClass, database);
    let definition = internal.definition;
    let instance = definition.prepareInternalModel(internal, props);
    return { internal, instance };
  },

  // // { isNew: false, isLoaded: true }
  // _createLoadedInternalModel(modelClass, database, doc) {
  //   let internal = new InternalModel(this, modelClass, database);
  //   internal.deserialize(doc, false);
  //   internal.onLoaded(false);
  //   return internal;
  // }

});

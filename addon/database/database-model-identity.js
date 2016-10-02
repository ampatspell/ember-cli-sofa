import Ember from 'ember';
import EmptyObject from '../util/empty-object';
import { isString } from '../util/assert';

const {
  computed
} = Ember;

export default Ember.Mixin.create({

  _modelIdentity: computed(function() {
    if(!this.__modelIdentity) {
      this.__modelIdentity = new EmptyObject();
      this.__modelIdentity.all = Ember.A([]);           // all new and saved models
      this.__modelIdentity.saved = new EmptyObject();   // all saved
      this.__modelIdentity.deleted = new EmptyObject(); // all deleted
      this.__modelIdentity.type = new EmptyObject();    // saved by type
    }
    return this.__modelIdentity;
  }),

  _internalModelWithDocId(docId, includingDeleted=false) {
    isString('docId', docId);
    let storage = this.get('_modelIdentity');
    let internal = storage.saved[docId];
    if(!internal && includingDeleted) {
      internal = storage.deleted[docId];
    }
    return internal;
  },

  _storeSavedInternalModel(internal) {
    let docId = internal.docId;
    let storage = this.get('_modelIdentity');

    isString('internal.docId', docId);

    storage.saved[docId] = internal;
    delete storage.deleted[docId];

    storage.all.addObject(internal);

    let name = internal.modelName;
    let array = storage.type[name];
    if(!array) {
      array = Ember.A([]);
      storage.type[name] = array;
    }
    array.addObject(internal);
  },

  _storeCreatedInternalModel(internal) {
    this._storeSavedInternalModel(internal);
  },

  _storeLoadedInternalModel(internal) {
    this._storeSavedInternalModel(internal);
  }

});

import Ember from 'ember';
import EmptyObject from '../util/empty-object';
import { isString, assert } from '../util/assert';

const {
  on,
  A
} = Ember;

export default Ember.Mixin.create({

  _createModelIdentity: on('init', function() {
    let identity = new EmptyObject();
    identity.all = A([]);           // all new and saved models
    identity.new = A([]);           // new models
    identity.saved = new EmptyObject();   // all saved
    identity.deleted = new EmptyObject(); // all deleted
    identity.type = new EmptyObject();    // saved by type
    this._modelIdentity = identity;
  }),

  _internalModelWithDocId(docId, includingDeleted=false) {
    isString('docId', docId);
    let storage = this._modelIdentity;
    let internal = storage.saved[docId];
    if(!internal && includingDeleted) {
      internal = storage.deleted[docId];
    }
    return internal;
  },

  _internalModelsWithModelName(modelName) {
    let storage = this._modelIdentity;
    return storage.type[modelName] || [];
  },

  _storeNewInternalModel(internal) {
    let storage = this._modelIdentity;
    storage.new.addObject(internal);
    storage.all.addObject(internal);
  },

  _storeSavedInternalModel(internal) {
    let docId = internal.docId;
    let storage = this._modelIdentity;

    isString('internal.docId', docId);

    storage.saved[docId] = internal;
    delete storage.deleted[docId];

    storage.all.addObject(internal);
    storage.new.removeObject(internal);

    let name = internal.modelName;
    let array = storage.type[name];
    if(!array) {
      array = A([]);
      storage.type[name] = array;
    }
    array.addObject(internal);
  },

  _storeCreatedInternalModel(internal) {
    this._storeSavedInternalModel(internal);
  },

  _storeLoadedInternalModel(internal) {
    this._storeSavedInternalModel(internal);
  },

  _storeDeletedInternalModel(internal) {
    let docId = internal.docId;
    let storage = this._modelIdentity;

    isString('internal.docId', docId);

    delete storage.saved[docId];
    storage.deleted[docId] = internal;

    storage.all.removeObject(internal);
    storage.new.removeObject(internal);

    let name = internal.modelName;
    let array = storage.type[name];
    if(array) {
      array.removeObject(internal);
    }
  },

  //

  _unstoreNewInternalModel(internal) {
    assert('internal model must be isNew', internal.isNew);
    let storage = this._modelIdentity;
    storage.all.removeObject(internal);
    storage.new.removeObject(internal);
  },

  _internalModelWillChangeDatabase(internal) {
    this._unstoreNewInternalModel(internal);
  },

  _internalModelDidChangeDatabase(internal) {
    assert('internal model must be isNew', internal.isNew);
    let storage = this._modelIdentity;
    storage.all.addObject(internal);
    storage.new.addObject(internal);
  },

  _internalModelWillDestroy(internal) {
    if(!internal.isNew) {
      this._modelIdentity.all.arrayContentDidChange();
    } else {
      this._unstoreNewInternalModel(internal);
    }
  },

  _destroyInternalModelIdentity() {
    let identity = this._modelIdentity;

    identity.all.map(internal => internal.destroyModel());

    let deleted = identity.deleted;
    for(let key in deleted) {
      deleted[key].destroyModel();
    }
  }

});

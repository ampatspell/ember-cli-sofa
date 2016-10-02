import Ember from 'ember';
import { assert, isObject } from '../util/assert';

const {
  get,
  merge
} = Ember;

export default Ember.Mixin.create({

  _createExistingInternalModel(modelClass, modelId) {
    let internal = this.get('store')._createExistingInternalModel(modelClass, this, modelId);
    this._storeCreatedInternalModel(internal);
    return internal;
  },

  _deserializeDeletedDocumentToInternalModel(doc) {
    let docId = doc._id;

    let internal = this._internalModelWithDocId(docId, true);
    if(!internal) {
      return;
    }

    let definition = internal.definition;

    internal.withPropertyChanges(changed => {
      definition.deserializeDelete(internal, { id: docId, rev: doc._rev });
      internal.onDeleted(changed);
      this._storeDeletedInternalModel(internal);
    });

    return internal;
  },

  _assertDefinitionMatchesDocument(definition, doc) {
    assert({
      error: 'invalid_document',
      reason: `document '${doc._id}' is expected to be '${definition.modelName}'`
    }, definition.matchesDocument(doc));
  },

  _deserializeDocument(internal, doc) {
    let definition = internal.definition;
    internal.withPropertyChanges(changed => {
      definition.deserialize(internal, doc, changed);
      internal.onLoaded(changed);
      this._storeLoadedInternalModel(internal);
    }, true);
  },

  _deserializeSavedDocumentToInternalModel(doc, expectedModelClass, optional=true) {
    let docId = doc._id;

    let modelClass = this._modelClassForDocument(doc);
    if(!modelClass) {
      assert({ error: 'unknown_model', reason: `unknown model for document ${docId}` }, optional);
      return;
    }

    let internal = this._internalModelWithDocId(docId, true);
    let definition;

    if(internal) {
      definition = internal.definition;
      assert({
        error: 'inivalid_document',
        reason: `document '${docId}' is expected to be '${internal.modelName}' not '${get(modelClass, 'modelName')}'`
      }, modelClass === internal.modelClass);
    } else {
      definition = this._definitionForModelClass(modelClass);
      let modelId = definition.modelId(docId);
      internal = this._createExistingInternalModel(modelClass, modelId);
    }

    if(expectedModelClass && !definition.is(expectedModelClass)) {
      assert({
        error: 'invalid_document',
        reason: `document '${doc._id}' is expected to be '${get(expectedModelClass, 'modelName')}' not '${internal.modelName}'`
      }, optional);
      return;
    }

    this._deserializeDocument(internal, doc);

    return internal;
  },

  _deserializeDocumentToInternalModel(doc, expectedModelClass, optional=true) {
    isObject('document', doc);
    if(doc._deleted) {
      return this._deserializeDeletedDocumentToInternalModel(doc);
    } else {
      return this._deserializeSavedDocumentToInternalModel(doc, expectedModelClass, optional);
    }
  },

  _deserializeInternalModelSave(internal, json, changed) {
    let definition = internal.definition;
    definition.deserializeSaveOrUpdate(internal, json, changed);
    internal.onSaved(changed);
    this._storeSavedInternalModel(internal);
  },

  _deserializeInternalModelDelete(internal, json, changed) {
    let definition = internal.definition;
    definition.deserializeDelete(internal, json, changed);
    internal.onDeleted(changed);
    this._storeDeletedInternalModel(internal);
  },

  _existingInternalModelForModelClass(modelClass, modelId, opts) {
    let { create, deleted } = merge({ create: false, deleted: false }, opts);

    let definition = this._definitionForModelClass(modelClass);

    let docId = definition.docId(modelId);

    let internal = this._internalModelWithDocId(docId, deleted);
    if(!internal && create) {
      if(!deleted) {
        internal = this._internalModelWithDocId(docId, true);
      }
      if(!internal) {
        internal = this._createExistingInternalModel(modelClass, modelId);
      }
    }

    return internal;
  },

  _existingInternalModelForModelName(modelName, modelId, opts) {
    let modelClass = this.modelClassForName(modelName);
    return this._existingInternalModelForModelClass(modelClass, modelId, opts);
  }

});

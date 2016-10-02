import Ember from 'ember';
import { assert, isObject } from '../util/assert';

const {
  get
} = Ember;

export default Ember.Mixin.create({

  _createExistingInternalModel(modelClass, modelId) {
    return this.get('store')._createExistingInternalModel(modelClass, this, modelId);
  },

  _deserializeDeletedDocumentToInternalModel(/*doc*/) {
    throw new Error('not implemented');
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
    } else {
      definition = this._definitionForModelClass(modelClass);
    }

    if(internal) {
      assert({
        error: 'inivalid_document',
        reason: `document '${docId}' is expected to be '${internal.modelName}' not '${get(modelClass, 'modelName')}'`
      }, modelClass === internal.modelClass);
    } else {
      let modelId = definition.modelId(docId);
      internal = this._createExistingInternalModel(modelClass, modelId);
      this._storeCreatedInternalModel(internal);
    }

    internal.withPropertyChanges(changed => {
      definition.deserialize(internal, doc, changed);
      internal.onLoaded(changed);
      this._storeLoadedInternalModel(internal);
    }, true);

    if(expectedModelClass && !definition.is(expectedModelClass)) {
      assert({
        error: 'invalid_document',
        reason: `document '${doc._id}' is expected to be '${get(expectedModelClass, 'modelName')}' not '${internal.modelName}'`
      }, optional);
      return;
    }

    return internal;
  },

  _deserializeDocumentToInternalModel(doc, expectedModelClass, optional=true) {
    isObject('document', doc);
    if(doc._deleted) {
      return this._deserializeDeletedDocumentToInternalModel(doc);
    } else {
      return this._deserializeSavedDocumentToInternalModel(doc, expectedModelClass, optional);
    }
  }

});

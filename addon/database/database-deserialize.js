import Ember from 'ember';
import { assert, isObject } from '../util/assert';

const {
  get,
  merge,
  A
} = Ember;

export default Ember.Mixin.create({

  _createExistingInternalModel(modelClass, modelId) {
    let internal = this.get('store')._createExistingInternalModel(modelClass, this, modelId);
    this._storeCreatedInternalModel(internal);
    return internal;
  },

  _createTransientInternalModel(modelClass, modelId, props) {
    let internal = this.get('store')._createTransientInternalModel(modelClass, this, modelId, props);
    this._storeSavedInternalModel(internal);
    return internal;
  },

  _deserializeInternalModelAttachments(internal, doc) {
    let definition = internal.definition;
    internal.withPropertyChanges(changed => {
      definition.deserializeAttachments(internal, doc, changed);
    }, true);
    return internal;
  },

  _deserializeDeletedDocumentToInternalModel(doc) {
    let docId = doc._id;
    let rev = doc._rev;

    let internal = this._internalModelWithDocId(docId, true);
    if(!internal) {
      return;
    }

    assert({
      error: 'transient',
      reason: `cannot deserialize document '${docId}' delete for transient model '${internal.modelName}'`
    }, !internal.transient);

    if(!internal.shouldDeserializeRevision(rev)) {
      return internal;
    }

    internal.withPropertyChanges(changed => {
      let json = { id: docId, rev };
      this._deserializeInternalModelDelete(internal, json, changed);
    }, true);

    return internal;
  },

  _assertDefinitionMatchesDocument(definition, doc) {
    assert({
      error: 'invalid_document',
      reason: `document '${doc._id}' is expected to be '${definition.modelName}'`
    }, definition.matchesDocument(doc));
  },

  _deserializeDocument(internal, doc, type=null) {
    let definition = internal.definition;
    this._assertDefinitionMatchesDocument(definition, doc);
    internal.withPropertyChanges(changed => {
      definition.onLoaded(internal, doc, changed, type);
      this._storeLoadedInternalModel(internal);
    }, true);
  },

  _deserializeSavedDocumentToInternalModel(doc, expectedModelClass, optional=true, type=null) {
    let docId = doc._id;
    let rev = doc._rev;

    let modelClass = this._modelClassForDocument(doc);
    if(!modelClass && !expectedModelClass) {
      assert({ error: 'unknown_model', reason: `unknown model for document ${docId}` }, optional);
      return;
    }

    if(!modelClass) {
      modelClass = expectedModelClass;
    }

    let internal = this._internalModelWithDocId(docId, true);
    let definition;

    if(internal) {
      definition = internal.definition;
      assert({
        error: 'invalid_document',
        reason: `document '${docId}' is expected to be '${internal.modelName}' not '${get(modelClass.class, 'modelName')}'`
      }, modelClass === internal.modelClass);
    } else {
      definition = this._definitionForModelClass(modelClass);
      let modelId = definition.modelId(docId);
      internal = this._createExistingInternalModel(modelClass, modelId);
    }

    assert({
      error: 'transient',
      reason: `cannot deserialize document '${docId}' for transient model '${internal.modelName}'`
    }, !internal.transient);

    if(internal.shouldDeserializeRevision(rev)) {
      this._deserializeDocument(internal, doc, type);
    }

    if(expectedModelClass && !definition.is(expectedModelClass)) {
      if(optional) {
        return;
      }
      assert({
        error: 'invalid_document',
        reason: `document '${doc._id}' is expected to be '${get(expectedModelClass.class, 'modelName')}' not '${internal.modelName}'`
      }, optional);
      return;
    }

    return internal;
  },

  _deserializeDocumentToInternalModel(doc, expectedModelClass, optional=true, type=null) {
    isObject('document', doc);
    if(doc._deleted) {
      return this._deserializeDeletedDocumentToInternalModel(doc);
    } else {
      return this._deserializeSavedDocumentToInternalModel(doc, expectedModelClass, optional, type);
    }
  },

  _deserializeDocuments(docs, expectedModelClass, optional) {
    return A(A(A(docs).map(doc => {
      if(!doc) {
        // on high load it is possible that view returns row with already deleted document's key, value but w/o doc
        // see: https://issues.apache.org/jira/browse/COUCHDB-1797
        return;
      }
      return this._deserializeDocumentToInternalModel(doc, expectedModelClass, optional);
    })).compact());
  },

  _deserializeDocIdToInternalModel(modelClass, docId) {
    if(!docId) {
      return null;
    }

    let internal = this._internalModelWithDocId(docId, true);
    if(internal) {
      let definition = internal.definition;
      assert({
        error: 'invalid_document',
        reason: `document '${docId}' is expected to be ${get(modelClass.class, 'modelName')} not ${definition.modelName}`
      }, definition.is(modelClass));
      return internal;
    }

    let definition = this._definitionForModelClass(modelClass);
    let modelId = definition.modelId(docId);
    return this._createExistingInternalModel(modelClass, modelId);
  },

  _deserializeInternalModelSave(internal, json, changed) {
    internal.definition.onSaved(internal, json, changed);
    this._storeSavedInternalModel(internal);
  },

  _deserializeInternalModelDelete(internal, json, changed) {
    internal.definition.onDeleted(internal, json, changed);
    this._storeDeletedInternalModel(internal);
  },

  _existingInternalModelForModelClass(modelClass, modelId, opts, props) {
    let { create, deleted, transient } = merge({ create: false, deleted: false, transient: false }, opts);

    let definition = this._definitionForModelClass(modelClass);
    let docId = definition.docId(modelId);

    let internal = this._internalModelWithDocId(docId, deleted);
    if(!internal && create) {
      if(!deleted) {
        internal = this._internalModelWithDocId(docId, true);
      }
      if(!internal) {
        if(transient) {
          internal = this._createTransientInternalModel(modelClass, modelId, props);
        } else {
          internal = this._createExistingInternalModel(modelClass, modelId);
        }
      }
    }

    if(transient) {
      assert({
        error: 'transient',
        reason: `model '${definition.modelName}' with id '${modelId}' is already loaded`
      }, internal.transient);
    }

    return internal;
  },

  _transientInternalModelForModelClass(modelClass, modelId, props) {
    return this._existingInternalModelForModelClass(modelClass, modelId, { create: true, transient: true }, props);
  },

  _existingInternalModelForModelName(modelName, modelId, opts) {
    let modelClass = this.modelClassForName(modelName);
    return this._existingInternalModelForModelClass(modelClass, modelId, opts);
  },

  _transientInternalModelForModelName(modelName, modelId, props) {
    let modelClass = this.modelClassForName(modelName);
    return this._transientInternalModelForModelClass(modelClass, modelId, props);
  }

});

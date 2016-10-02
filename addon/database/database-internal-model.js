import Ember from 'ember';
import Error from '../util/error';

const {
  merge,
  RSVP: { resolve, reject }
} = Ember;

export default Ember.Mixin.create({

  _suspendChanges() {
    return () => {};
  },

  _invokeInternalWillSaveCallbacks(internal) {
    let model = internal.model;
    if(!model) {
      return resolve();
    }

    return resolve().then(() => {
      let isNew = internal.state.isNew;
      if(isNew) {
        return model.willCreate();
      }
    }).then(() => {
      return model.willSave();
    });
  },

  _isInternalModelUnique(internal) {
    let docId = internal.docId;
    if(docId) {
      let existing = this._internalModelWithDocId(docId);
      if(existing && existing !== internal) {
        return false;
      }
    }
    return true;
  },

  _validateInternalModelUniquiness(internal) {
    if(this._isInternalModelUnique(internal)) {
      return resolve();
    }
    return reject(new Error({
      error: 'conflict',
      reason: 'Document update conflict'
    }));
  },

  _onInternalModelWillSave(internal) {
    return resolve().then(() => {
      return this._invokeInternalWillSaveCallbacks(internal);
    }).then(() => {
      return this._validateInternalModelUniquiness(internal);
    });
  },

  _onInternalModelSaving(internal) {
    internal.withPropertyChanges(changed => {
      internal.onSaving(changed);
    }, true);
  },

  _onInternalModelSavedOrUpdated(internal, json) {
    internal.withPropertyChanges(changed => {
      this._deserializeInternalModelSave(internal, json, changed);
    }, true);
  },

  _onInternalModelSaveFailed(internal, err) {
    internal.withPropertyChanges(changed => {
      internal.onError(err, changed);
    }, true);
  },

  _reloadInternalModelAttachments(internal, json) {
    console.log('TODO: database-model-operations._reloadInternalModelAttachments', internal, json);
    return resolve();
  },

  _saveInternalModel(internal, opts) {
    opts = merge({}, opts);

    let force = !!opts.force;

    let isNew = internal.state.isNew;
    let isDeleted = internal.state.isDeleted;
    let isDirty = internal.state.isDirty;

    if(!force && !isDirty && !isNew && !isDeleted) {
      return resolve(internal);
    }

    let documents = this.get('documents');
    let resume;

    return resolve().then(() => {
      return this._onInternalModelWillSave(internal);
    }).then(() => {
      let doc = this._serializeInternalModelToDocument(internal, false);
      this._onInternalModelSaving(internal);
      resume = this._suspendChanges();
      return documents.save(doc);
    }).then(json => {
      this._onInternalModelSavedOrUpdated(internal, json);
      if(json.reload) {
        return this._reloadInternalModelAttachments(internal, json);
      }
    }).then(() => {
      resume();
      return internal;
    }, err => {
      this._onInternalModelSaveFailed(internal, err);
      if(resume) {
        resume();
      }
      return reject(err);
    });
  },

  _onInternalModelLoading(internal) {
    internal.withPropertyChanges(changed => {
      internal.onLoading(changed);
    }, true);
  },

  _isNotFoundDeleted(err) {
    return err.error === 'not_found' && err.reason === 'deleted';
  },

  _isNotFoundMissing(err) {
    return err.error === 'not_found' && err.reason === 'missing';
  },

  _isNotFoundMissingOrDeleted(err) {
    return this._isNotFoundMissing(err) || this._isNotFoundDeleted(err);
  },

  _onInternalModelLoadFailed(internal, err) {
    internal.withPropertyChanges(changed => {
      if(this._isNotFoundMissingOrDeleted(err)) {
        this._deserializeInternalModelDelete(internal, null, changed);
      }
      internal.onError(err, changed);
    }, true);
  },

  _onInternalModelLoaded(internal, doc) {
    let definition = internal.definition;
    this._assertDefinitionMatchesDocument(definition, doc);
    this._deserializeDocument(internal, doc);
    return internal;
  },

  _reloadInternalModel(internal) {
    if(internal.state.isNew) {
      return reject(new Error({ error: 'not_saved', reason: 'Model is not saved yet' }));
    }

    let docId = internal.docId;
    let documents = this.get('documents');

    return resolve().then(() => {
      this._onInternalModelLoading(internal);
      return documents.load(docId);
    }).then(doc => {
      return this._onInternalModelLoaded(internal, doc);
    }, err => {
      this._onInternalModelLoadFailed(internal, err);
      return reject(err);
    });
  },

  _loadInternalModel(internal, opts) {
    opts = merge({}, opts);
    if(internal.state.isLoaded && !opts.force) {
      return resolve(internal);
    }
    if(internal.state.isNew) {
      return resolve(internal);
    }
    return this._reloadInternalModel(internal);
  },

  _loadInternalModelForModelName(modelName, modelId, opts) {
    let modelClass = this.modelClassForName(modelName);
    let internal = this._existingInternalModelForModelClass(modelClass, modelId, { deleted: true });
    if(internal) {
      return this._loadInternalModel(internal, opts);
    }

    let definition = this._definitionForModelClass(modelClass);
    let docId = definition.docId(modelId);

    return this.get('documents').load(docId).then(doc => {
      internal = this._createExistingInternalModel(modelClass, modelId);
      return this._onInternalModelLoaded(internal, doc);
    });
  },

  _onInternalModelDeleted(internal, json) {
    internal.withPropertyChanges(changed => {
      this._deserializeInternalModelDelete(internal, json, changed);
    }, true);
  },

  _onInternalModelDeleteFailed(internal, err) {
    if(this._isNotFoundDeleted(err)) {
      internal.withPropertyChanges(changed => {
        this._deserializeInternalModelDelete(internal, null, changed);
        internal.onError(err, changed);
      });
      return resolve(internal);
    }
    internal.onError(err);
    return reject(err);
  },

  _deleteInternalModel(internal) {
    if(internal.state.isNew) {
      return reject(new Error({ error: 'not_saved', reason: 'Model is not saved yet' }));
    }

    let docId = internal.docId;
    let rev = internal.rev;
    let documents = this.get('documents');
    return documents.delete(docId, rev).then(json => {
      this._onInternalModelDeleted(internal, json);
      return internal;
    }, err => {
      return this._onInternalModelDeleteFailed(internal, err);
    });
  },

  _deserializeDocuments(docs, expectedModelClass, optional) {
    return Ember.A(Ember.A(docs.map(doc => {
      if(!doc) {
        // on high load it is possible that view returns row with already deleted document's key, value but w/o doc
        // see: https://issues.apache.org/jira/browse/COUCHDB-1797
        return;
      }
      return this._deserializeDocumentToInternalModel(doc, expectedModelClass, optional);
    })).compact());
  },

  _expectedModelClassFromOpts(opts) {
    let model = opts.model;
    if(model) {
      delete opts.model;
      return this.modelClassForName(model);
    }
  },

  _optionalFromOpts(opts) {
    let optional = opts.optional;
    delete opts.optional;
    return !!optional;
  },

  _internalModelView(opts) {
    opts = merge({ include_docs: true }, opts);

    let ddoc = opts.ddoc;
    delete opts.ddoc;

    let view = opts.view;
    delete opts.view;

    let expectedModelClass = this._expectedModelClassFromOpts(opts);
    let optional = this._optionalFromOpts(opts);

    let documents = this.get('documents');
    return documents.view(ddoc, view, opts).then(json => {
      return this._deserializeDocuments(Ember.A(json.rows).map(row => row.doc), expectedModelClass, optional);
    });
  },

  _internalModelMango(opts) {
    opts = merge({}, opts);

    let expectedModelClass = this._expectedModelClassFromOpts(opts);
    let optional = this._optionalFromOpts(opts);

    let documents = this.get('documents');
    return documents.mango(opts).then(json => {
      return this._deserializeDocuments(json.docs, expectedModelClass, optional);
    });
  },

  _internalModelAll(opts) {
    opts = merge({ include_docs: true }, opts);

    let expectedModelClass = this._expectedModelClassFromOpts(opts);
    let optional = this._optionalFromOpts(opts);

    let documents = this.get('documents');
    return documents.all(opts).then(json => {
      return this._deserializeDocuments(Ember.A(json.rows).map(row => row.doc), expectedModelClass, optional);
    });
  }

});

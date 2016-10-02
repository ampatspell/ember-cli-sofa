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
      internal.onSaved(changed);
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
  }

});

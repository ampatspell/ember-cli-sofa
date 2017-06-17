import Ember from 'ember';

const {
  merge
} = Ember;

export default methods => Ember.Mixin.create(merge({

  _createChangesForInternalChanges(internal) {
    return this.get('store')._createChangesForInternalChanges(internal);
  },

  _changesClassForName(name) {
    return this.get('store')._changesClassForName(name);
  },

  _existingChanges(changesClass, opts, create=false) {
    let identifier = this._changesIdentifier(changesClass, opts);
    let internal = this._existingChangesForIdentifier(identifier);
    if(!internal && create) {
      internal = this._createInternalChanges(changesClass, identifier, opts);
      this._onInternalChangesCreated(internal);
    }
    return internal;
  },

  changes(name, opts) {
    let changesClass = this._changesClassForName(name);
    let internal = this._existingChanges(changesClass, opts, true);
    return internal.getChangesModel();
  }

}, methods));

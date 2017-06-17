import Ember from 'ember';
import DatabaseInternalChanges from '../changes/database/internal-changes';

export default Ember.Mixin.create({

  _createChangesForInternalChanges(internal) {
    return this.get('store')._createChangesForInternalChanges(internal);
  },

  _changesClassForName(name) {
    return this.get('store')._changesClassForName(name);
  },

  _createInternalChanges(changesClass, identifier, opts) {
    return new DatabaseInternalChanges(this, changesClass, identifier, opts);
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

});

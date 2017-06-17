import Ember from 'ember';
import EmptyObject from '../../util/empty-object';
import { destroyObject } from '../../util/destroy';

const {
  get,
  on
} = Ember;

export default Ember.Mixin.create({

  _createChangesIdentity: on('init', function() {
    this._changesIdentity = new EmptyObject();
  }),

  _serializeChangesOpts(opts) {
    return JSON.stringify(opts);
  },

  _changesIdentifier(changesClass, opts) {
    if(!opts) {
      opts = null;
    }
    let modelName = get(changesClass, 'modelName');
    let serializedOpts = this._serializeChangesOpts(opts);
    return `${modelName} ${serializedOpts}`;
  },

  _existingChangesForIdentifier(identifier) {
    return this._changesIdentity[identifier];
  },

  _onInternalChangesCreated(changes) {
    let identifier = changes.identifier;
    this._changesIdentity[identifier] = changes;
    return changes;
  },

  _onInternalChangesDestroyed(changes) {
    let identifier = changes.identifier;
    delete this._changesIdentity[identifier];
  },

  _destroyInternalChangesIdentity() {
    destroyObject(this._changesIdentity);
  },

  _suspendChanges() {
    let resumes = [];
    let identity = this._changesIdentity;
    for(let key in identity) {
      resumes.push(identity[key].suspend());
    }
    return () => {
      return resumes.map(resume => resume());
    };
  },

});

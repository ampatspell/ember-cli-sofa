import Ember from 'ember';
import EmptyObject from '../util/empty-object';

const {
  get,
  on
} = Ember;

export default Ember.Mixin.create({

  _createCollectionIdentity: on('init', function() {
    this._collectionIdentity = new EmptyObject();
  }),

  _serializeCollectionOpts(opts) {
    return JSON.stringify(opts);
  },

  _collectionIdentifier(collectionClass, opts) {
    if(!opts) {
      opts = null;
    }
    let modelName = get(collectionClass, 'modelName');
    let serializedOpts = this._serializeCollectionOpts(opts);
    return `${modelName} ${serializedOpts}`;
  },

  _existingCollectionForIdentifier(identifier) {
    return this._collectionIdentity[identifier];
  },

  _onInternalCollectionCreatedForIdentifier(identifier, internal) {
    this._collectionIdentity[identifier] = internal;
    return internal;
  },

  _onInternalCollectionDestroyed(internal) {
    let identifier = this._collectionIdentifier(internal.collectionClass, internal.opts);
    delete this._collectionIdentity[identifier];
  }

});

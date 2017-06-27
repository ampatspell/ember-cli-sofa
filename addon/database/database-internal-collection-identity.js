import Ember from 'ember';
import EmptyObject from '../util/empty-object';
import { destroyObject } from '../util/destroy';

const {
  get,
  on
} = Ember;

export default Ember.Mixin.create({

  _createCollectionIdentity: on('init', function() {
    this._collectionIdentity = new EmptyObject();
    this._collectionIdentity.all = new EmptyObject();
    this._collectionIdentity.initial = new EmptyObject();
  }),

  _setCollectionIdentityInitialState(identifier, state) {
    this._collectionIdentity.initial[identifier] = state;
  },

  _popCollectionIdentityInitialState(identifier) {
    let state = this._collectionIdentity.initial[identifier];
    delete this._collectionIdentity.initial[identifier];
    return state;
  },

  _serializeCollectionOpts(opts) {
    return JSON.stringify(opts);
  },

  _collectionIdentifier(collectionClass, opts) {
    if(!opts) {
      opts = null;
    }
    let modelName = get(collectionClass.class, 'modelName');
    let serializedOpts = this._serializeCollectionOpts(opts);
    return `${modelName} ${serializedOpts}`;
  },

  _existingCollectionForIdentifier(identifier) {
    return this._collectionIdentity.all[identifier];
  },

  _onInternalCollectionCreatedForIdentifier(identifier, internal) {
    this._collectionIdentity.all[identifier] = internal;
    return internal;
  },

  _onInternalCollectionDestroyed(internal) {
    let identifier = this._collectionIdentifier(internal.collectionClass, internal.opts);
    delete this._collectionIdentity.all[identifier];
  },

  _destroyInternalCollectionIdentity() {
    destroyObject(this._collectionIdentity.all);
  }

});

import Ember from 'ember';
import InternalCollection from '../collection/internal-collection';

export default Ember.Mixin.create({

  _collectionClassForName(name) {
    return this.get('store')._collectionClassForName(name);
  },

  _createCollectionForInternalCollection(internal) {
    return this.get('store')._createCollectionForInternalCollection(internal);
  },

  _createInternalCollection(collectionClass, opts) {
    return new InternalCollection(this, collectionClass, opts);
  },

  _existingCollection(collectionClass, opts, create=false) {
    let identifier = this._collectionIdentifier(collectionClass, opts);
    let internal = this._existingCollectionForIdentifier(identifier);
    if(!internal && create) {
      internal = this._createInternalCollection(collectionClass, opts);
      this._onInternalCollectionCreatedForIdentifier(identifier, internal);
    }
    return internal;
  },

  collection(name, opts) {
    let collectionClass = this._collectionClassForName(name);
    let internal = this._existingCollection(collectionClass, opts, true);
    return internal.getCollectionModel();
  }

});

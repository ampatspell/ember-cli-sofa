import Ember from 'ember';
import InternalCollection from '../collection/internal-collection';

export default Ember.Mixin.create({

  _collectionClassForName(name) {
    return this.get('store')._collectionClassForName(name);
  },

  _createInternalCollection(collectionClass, opts) {
    return new InternalCollection(this, collectionClass, opts);
  },

  collection(name, opts) {
    let collectionClass = this._collectionClassForName(name);
    let internal = this._createInternalCollection(collectionClass, opts);
    return internal.getCollectionModel();
  }

});

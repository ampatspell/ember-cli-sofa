import Ember from 'ember';
import Transform from './collection-transform';
import CollectionMatch from './collection-match';
import CollectionLoad from './collection-load';
import Error from '../util/error';

const {
  guidFor,
  get
} = Ember;

const Collection = Ember.ArrayProxy.extend(
  Transform,
  CollectionMatch,
  CollectionLoad, {

  _internal: null,

  toString() {
    return `<collection@:${get(this.constructor, 'modelName')}::${guidFor(this)}>`;
  },

  willDestroy() {
    this._internal.collectionWillDestroy();
    this._super();
  }

});

Collection.reopenClass({

  modelName: null,
  queryName: null,

  _create: Collection.create,

  create() {
    throw new Error({
      error: 'internal',
      reason: 'use `database.collection` to create new collections'
    });
  }

});

export default Collection;

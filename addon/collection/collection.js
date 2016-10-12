import Ember from 'ember';
import Transform from './collection-transform';
import CollectionMatch from './collection-match';
import CollectionLoad from './collection-load';
import Error from '../util/error';

const Collection = Ember.ArrayProxy.extend(
  Transform,
  CollectionMatch,
  CollectionLoad, {

  _internal: null

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

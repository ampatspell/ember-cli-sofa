import Ember from 'ember';
import Transform from './collection-transform';
import CollectionMatch from './collection-match';
import CollectionLoad from './collection-load';

const Collection = Ember.ArrayProxy.extend(
  Transform,
  CollectionMatch,
  CollectionLoad, {

  _internal: null,

  willDestroy() {
    this._internal.collectionWillDestroy();
    this._super();
  }

});

Collection.reopenClass({

  modelName: null,
  queryName: null

});

export default Collection;

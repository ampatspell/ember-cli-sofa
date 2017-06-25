import Ember from 'ember';
import { getInternalModel } from '../internal-model';
import CollectionLoader from './collection-loader';
import QueryFindMixin from '../util/query-find-mixin';
import CollectionQueryMixin from './collection-query';

const {
  A
} = Ember;

export default class InternalCollection {

  constructor(database, collectionClass, opts, state) {
    this.database = database;
    this.store = database.get('store');
    this.collectionClass = collectionClass;
    this.opts = opts;
    this.collectionModel = null;
    this.content = A();
    this.internalModels = database._modelIdentity.all;
    this.loader = new CollectionLoader(this);
    if(state.isLoaded) {
      this.loader.setLoaded(true);
    }
  }

  modelClassForName(modelName) {
    if(!modelName) {
      return;
    }
    return this.database.modelClassForName(modelName, 'collection');
  }

  createCollectionModel() {
    return this.database._createCollectionForInternalCollection(this);
  }

  getCollectionModel() {
    let model = this.collectionModel;
    if(!model) {
      model = this.createCollectionModel();
      this.collectionModel = model;
    }
    return model;
  }

  //

  createQuery() {
    return this.store._createQueryForInternalCollection(this, {
      name: 'collection-find',
      prepare: Query => Query.extend(QueryFindMixin, CollectionQueryMixin)
    });
  }

  getQuery() {
    let query = this.query;
    if(!query) {
      query = this.createQuery();
      this.query = query;
    }
    return query;
  }

  collectionLoaderDidLoad() {
  }

  //

  internalModelFromModel(model) {
    if(!model) {
      return null;
    }
    return getInternalModel(model);
  }

  modelFromInternalModel(internal) {
    if(!internal) {
      return null;
    }
    return internal.getModel();
  }

  //

  serialize() {
    if(!this.collectionModel) {
      return;
    }
    return {
      isLoaded: this.loader.state.isLoaded
    };
  }

  collectionWillDestroy() {
    this.database._onInternalCollectionDestroyed(this);
  }

  destroy() {
    let model = this.collectionModel;
    if(model) {
      model.destroy();
    }
    let query = this.query;
    if(query) {
      query.destroy();
    }
  }

}

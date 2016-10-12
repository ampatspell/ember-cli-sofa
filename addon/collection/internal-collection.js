import Ember from 'ember';
import { getInternalModel } from '../internal-model';
import CollectionLoader from './collection-loader';
import QueryFindMixin from '../util/query-find-mixin';
import CollectionQueryMixin from './collection-query';

const {
  merge
} = Ember;

export default class InternalCollection {

  constructor(database, collectionClass, opts) {
    this.database = database;
    this.collectionClass = collectionClass;
    this.opts = opts;
    this.collectionModel = null;
    this.content = Ember.A();
    this.internalModels = database._modelIdentity.all;
    this.loader = new CollectionLoader(this);
  }

  modelClassForName(modelName) {
    if(!modelName) {
      return;
    }
    return this.database.modelClassForName(modelName, 'collection');
  }

  createCollectionModel() {
    return this.collectionClass._create(merge({ _internal: this, content: this.content }, this.opts));
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
    let collection = this.getCollectionModel();
    let queryModelName = collection.get('queryName');
    if(!queryModelName) {
      return;
    }
    let Query = this.database.get('store')._queryClassForName(queryModelName, 'collection-find', Query => {
      return Query.extend(QueryFindMixin, CollectionQueryMixin);
    });
    return Query._create({ _internalCollection: this });
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

}
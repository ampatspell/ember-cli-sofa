import Ember from 'ember';
import { getInternalModel } from './internal-model';

export default class InternalCollection {

  constructor(database, collectionClass, opts) {
    this.database = database;
    this.collectionClass = collectionClass;
    this.opts = opts;
    this.collectionModel = null;
    this.content = Ember.A();
    this.models = database._modelIdentity.all;
  }

  createCollectionModel() {
    let content = this.content;
    let _internal = this;
    return this.collectionClass.create({ _internal, content });
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

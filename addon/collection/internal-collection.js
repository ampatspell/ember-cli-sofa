import Ember from 'ember';
import { getInternalModel } from '../internal-model';

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

import Ember from 'ember';

const {
  getOwner
} = Ember;

export function createInternalDatabase(internalStore, identifier, documents) {
  let internal = new InternalDatabase(internalStore.store, internalStore, identifier, documents);
  let database = getOwner(internalStore.store).lookup('sofa:database').create({ _internal: internal });
  internal.database = database;
  return internal;
}

export default class InternalDatabase {

  constructor(store, internalStore, identifier, documents) {
    this.store = store;
    this.internalStore = internalStore;
    this.identifier = identifier;
    this.documents = documents;
    this._database = null;
  }

  modelClassForName(modelName) {
    return this.internalStore.modelClassForName(modelName);
  }

  model(modelName, props) {
    return this.internalStore.createModelForNameWithDatabase(modelName, this.database, props);
  }

  push(doc) {
    let modelClass = this.modelClassForName(doc.type);
    let internal = this.internalStore.createLoadedInternalModel(modelClass, this.database, doc);
    return internal.getModel();
  }

}

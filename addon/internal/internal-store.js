import Ember from 'ember';
import { assert, notBlank, isClass_ } from '../assert';
import SofaModel from '../model';
import InternalModel, { internalPropertyName } from './internal-model';
import { createInternalDatabase } from './internal-database';

const {
  getOwner,
  typeOf,
  String: { dasherize },
  set
} = Ember;

const __sofa_type__ = '__sofa_type__';
const __sofa_model_type__ = 'model';

export default class InternalStore {

  constructor(store) {
    this.store = store;
    this.databases = {};
    this.classCache = {};
    this.couches = getOwner(store).lookup('couch:couches').create();
  }

  databaseOptionsForIdentifier(identifier) {
    let databaseOptions = this.store.databaseOptionsForIdentifier(identifier);
    assert(`database options must be object not ${databaseOptions}`, typeOf(databaseOptions) === 'object');
    assert(`database options.url must be string not ${databaseOptions.url}`, typeOf(databaseOptions.url) === 'string');
    assert(`database options.name must be string not ${databaseOptions.name}`, typeOf(databaseOptions.name) === 'string');
    return databaseOptions;
  }

  createCouchDatabase({ url, name }) {
    let couch = this.couches.couch({ url });
    return couch.database(name);
  }

  createDatabase(identifier) {
    let databaseOptions = this.databaseOptionsForIdentifier(identifier);
    let documents = this.createCouchDatabase(databaseOptions);
    let internalDatabase = createInternalDatabase(this, identifier, documents);
    return internalDatabase.database;
  }

  database(identifier) {
    let dbs = this.databases;
    let db = dbs[identifier];
    if(!db) {
      db = this.createDatabase(identifier);
      dbs[identifier] = db;
    }
    return db;
  }

  normalizeModelName(modelName) {
    notBlank('model name', modelName);
    return dasherize(modelName);
  }

  classForName(prefix, modelName, prepareFn) {
    let normalizedModelName = this.normalizeModelName(modelName);
    let fullName = `${prefix}:${normalizedModelName}`;
    let cache = this.classCache;
    let Class = cache[fullName];
    if(!Class) {
      Class = getOwner(this.store).lookup(fullName);
      isClass_(`class for name ${fullName} is not registered`, Class);
      if(prepareFn) {
        Class = prepareFn(Class, normalizedModelName);
      }
      set(Class, 'modelName', normalizedModelName);
      cache[fullName] = Class;
    }
    return Class;
  }

  isModelClass(Model) {
    let curr = Model;
    while(curr) {
      if(curr === SofaModel) {
        return true;
      }
      curr = curr.superclass;
    }
    return false;
  }

  modelClassForName(modelName) {
    return this.classForName('model', modelName, (Model, normalizedModelName) => {
      assert(`model '${normalizedModelName}' must be sofa Model`, this.isModelClass(Model));
      let store = this.store;
      let Extended = Model.extend();
      Extended.reopenClass({ store, [__sofa_type__]: __sofa_model_type__ });
      return Extended;
    });
  }

  createModelForInternalModel(internal, modelProps) {
    let modelClass = internal.modelClass;
    let model = modelClass._create({ [internalPropertyName]: internal });
    if(modelProps) {
      model.setProperties(modelProps);
    }
    return model;
  }

  createModelForNameWithDatabase(modelName, database) {
    let Model = this.modelClassForName(modelName);
    let internal = this.createNewInternalModel(Model, database);
    // TODO: props
    return internal.getModel();
  }

  createModelForName(modelName, props) {
    return this.createModelForNameWithDatabase(modelName, null, props);
  }

  // { isNew: true }
  createNewInternalModel(modelClass, database) {
    return new InternalModel(this, modelClass, database);
  }

  // { isNew: false, isLoaded: true }
  createLoadedInternalModel(modelClass, database, doc) {
    let internal = new InternalModel(this, modelClass, database);
    internal.deserialize(doc, false);
    internal.onLoaded(false);
    return internal;
  }

}

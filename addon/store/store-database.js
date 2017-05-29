import Ember from 'ember';
import { lookup, object } from '../util/computed';
import { assert } from '../util/assert';
import { destroyObject } from '../util/destroy';

const {
  typeOf,
  getOwner,
  Logger: { warn }
} = Ember;

const lookupWithStore = name => {
  return lookup(name, function() {
    return { store: this };
  });
};

export default Ember.Mixin.create({

  _couches: lookup('sofa:couches'),
  _databases: object(),

  databaseOptionsForIdentifier(/*identifier*/) {
    warn('override Store.databaseOptionsForIdentifier(identifier) and return { url, name } for given identifier');
  },

  _databaseOptionsForIdentifier(identifier) {
    let databaseOptions = this.databaseOptionsForIdentifier(identifier);
    assert(`database options must be object not ${databaseOptions}`, typeOf(databaseOptions) === 'object');
    assert(`database options.url must be string not ${databaseOptions.url}`, typeOf(databaseOptions.url) === 'string');
    assert(`database options.name must be string not ${databaseOptions.name}`, typeOf(databaseOptions.name) === 'string');
    return databaseOptions;
  },

  _createCouch({ url }) {
    return this.get('_couches').couch({ url });
  },

  _createDocuments(couch, { name }) {
    return couch.get('documents').database(name);
  },

  _lookupDatabaseClass(identifier) {
    let owner = getOwner(this);
    return owner.factoryFor(`sofa/database:${identifier}`) || owner.factoryFor('sofa:database');
  },

  _createDatabase(identifier) {
    let databaseOptions = this._databaseOptionsForIdentifier(identifier);
    let couch = this._createCouch(databaseOptions);
    let documents = this._createDocuments(couch, databaseOptions);
    let store = this;
    let Database = this._lookupDatabaseClass(identifier);
    return Database.create({ identifier, store, couch, documents });
  },

  database(identifier) {
    let dbs = this.get('_databases');
    let db = dbs[identifier];
    if(!db) {
      db = this._createDatabase(identifier);
      dbs[identifier] = db;
    }
    return db;
  },

  db: lookupWithStore('sofa:databases'),

  _destroyDatabases() {
    destroyObject(this.get('_databases'));
  },

  _destroyCouches() {
    this.get('_couches').destroy();
  }

});

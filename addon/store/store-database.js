import Ember from 'ember';
import { lookup, object } from '../util/computed';
import { assert } from '../util/assert';

const {
  typeOf,
  getOwner,
  Logger: { warn }
} = Ember;

const lookupWithStore = (name) => {
  return lookup(name, function() {
    return { store: this };
  });
};

export default Ember.Mixin.create({

  _couches: lookup('couch:couches'),
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

  _createCouchDatabase({ url, name }) {
    let couch = this.get('_couches').couch({ url });
    return couch.database(name);
  },

  _createDatabase(identifier) {
    let databaseOptions = this._databaseOptionsForIdentifier(identifier);
    let documents = this._createCouchDatabase(databaseOptions);
    let store = this;
    return getOwner(this).lookup('sofa:database').create({ store, identifier, documents });
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

  db: lookupWithStore('sofa:databases')

});

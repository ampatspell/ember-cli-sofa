import { configurations } from '../helpers/setup';

let store;
let db;

configurations(({ module, test, createStore, config }) => {

  module('multiple-couches', () => {
    store = createStore();
    db = store.get('db.main');
  });

  test('info', assert => {
    return db.get('documents.couch').info().then(json => {
      assert.equal('Welcome', json.couchdb);
      assert.ok(json.version.indexOf(config.name) === 0);
    });
  });

});

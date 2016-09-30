import { module, test, createStore } from '../helpers/setup';
import Store from 'sofa/store';

let store;

module('store-create', () => {
  store = createStore();
});

test('exists', assert => {
  assert.ok(store);
  assert.ok(Store.detectInstance(store));
});

test('test database exists and is writable', assert => {
  let db = store.get('db.main.documents');
  return db.info().then(json => {
    assert.ok(json.db_name.indexOf('ember-cli-sofa') !== -1);
    assert.equal(json.db_name, db.get('name'));
    return db.save({ _id: 'test' });
  }).then(json => {
    assert.ok(json.ok);
    return db.delete(json.id, json.rev);
  });
});

import { module, test, createStore } from '../helpers/setup';

let store;
let db;

module('multiple-couches', () => {
  store = createStore();
  db = store.get('db.main');
});

test('ok', assert => {
  assert.ok(db);
});

import { module, test, createStore, registerModels, registerCollections, cleanup, next } from '../helpers/setup';
import { Collection, Model, prefix } from 'sofa';

let store;
let db;

let Duck = Model.extend({
  id: prefix()
});

let Ducks = Collection.extend({
  modelName: 'duck'
});

module('database', () => {
  registerModels({ Duck });
  registerCollections({ Ducks });
  store = createStore();
  db = store.get('db.main');
  db.set('modelNames', [ 'duck' ]);
  return cleanup(store, [ 'main' ]);
});

test('destroy database destroys collections', assert => {
  let collection = db.collection('ducks');
  db.destroy();
  return next().then(() => {
    assert.ok(collection.isDestroyed);
  });
});

test('destroy store destroys collections', assert => {
  let collection = db.collection('ducks');
  store.destroy();
  return next().then(() => {
    assert.ok(collection.isDestroyed);
  });
});

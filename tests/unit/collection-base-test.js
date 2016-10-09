import { module, test, createStore, registerModels, registerCollections, cleanup } from '../helpers/setup';
import { Collection, Model, prefix, belongsTo, hasMany } from 'sofa';

let store;
let db;

let Duck = Model.extend({
  id: prefix(),
  house: belongsTo('house', { inverse: 'ducks', persist: false })
});

let House = Model.extend({
  id: prefix(),
  ducks: hasMany('duck', { inverse: 'house' })
});

let Ducks = Collection.extend({

  modelName: 'duck'

});

module('collection-base', () => {
  registerModels({ Duck, House });
  registerCollections({ Ducks });
  store = createStore();
  db = store.get('db.main');
  db.set('modelNames', [ 'duck', 'house' ]);
  return cleanup(store, [ 'main' ]);
});

test('collection can be created', assert => {
  let collection = db.collection('ducks');
  assert.ok(Ducks.detectInstance(collection));
  assert.ok(collection.constructor.__sofa_type__ === 'collection');
  assert.ok(collection.constructor.modelName === 'ducks');
  assert.ok(collection._internal);
});

test('collection has models', assert => {
  let one = db.model('duck', { id: 'one' });
  let two = db.model('duck', { id: 'two' });
  db.model('house', { id: 'one' });

  let collection = db.collection('ducks');
  assert.deepEqual(collection.get('models').mapBy('docId'), [ "duck:one", "duck:two", "house:one"]);
  assert.equal(collection.mapBy('docId'), [ 'duck:one', 'duck:two' ]);
});

test('collection has filtered content', assert => {
  let one = db.model('duck', { id: 'one' });
  let two = db.model('duck', { id: 'two' });
  db.model('house', { id: 'one' });

  let collection = db.collection('ducks');
  assert.deepEqual(collection.mapBy('docId'), [ 'duck:one', 'duck:two' ]);
});

test.only('collection has live filtered content', assert => {
  let one = db.model('duck', { id: 'one' });
  let two = db.model('duck', { id: 'two' });
  db.model('house', { id: 'one' });

  let collection = db.collection('ducks');
  assert.deepEqual(collection.mapBy('docId'), [ 'duck:one', 'duck:two' ]);

  collection.set('modelName', 'house');
  assert.deepEqual(collection.mapBy('docId'), [ 'house:one' ]);
});

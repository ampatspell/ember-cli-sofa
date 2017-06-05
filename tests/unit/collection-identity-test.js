import { module, test, createStore, registerModels, registerCollections, cleanup, next } from '../helpers/setup';
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

module('collection-identity', () => {
  registerModels({ Duck, House });
  registerCollections({ Ducks });
  store = createStore();
  db = store.get('db.main');
  db.set('modelNames', [ 'duck', 'house' ]);
  return cleanup(store, [ 'main' ]);
});

test('collection returns same instance when declared w/o params', assert => {
  assert.ok(db.collection('ducks') === db.collection('ducks'));
});

test('collection returns same instance when declared with params', assert => {
  assert.ok(db.collection('ducks', { house: 'big' }) === db.collection('ducks', { house: 'big' }));
  assert.deepEqual(db.collection('ducks', { house: 'big' }).get('_internal.opts'), { house: 'big' });
});

test('collections are stored in identity', assert => {
  let coll = db.collection('ducks');
  assert.ok(db._collectionIdentity.all['ducks null'] === coll._internal);
});

test('collection opts serialization', assert => {
  assert.equal(db._serializeCollectionOpts({ house: 'big' }), '{"house":"big"}');
});

test('collection identifier', assert => {
  let className = db._collectionClassForName('ducks');
  assert.equal(db._collectionIdentifier(className, { house: 'big' }), 'ducks {"house":"big"}');
  assert.equal(db._collectionIdentifier(className, null), 'ducks null');
  assert.equal(db._collectionIdentifier(className), 'ducks null');
});

test('collection is removed from identity on destroy', assert => {
  let coll = db.collection('ducks');
  assert.ok(db._collectionIdentity.all['ducks null']);
  coll.destroy();
  return next().then(() => {
    assert.ok(!db._collectionIdentity.all['ducks null']);
  });
});

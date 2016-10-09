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

  model: 'duck'

});

module('collection-base', () => {
  registerModels({ Duck, House });
  registerCollections({ Ducks });
  store = createStore();
  db = store.get('db.main');
  db.set('modelNames', [ 'duck', 'house' ]);
  return cleanup(store, [ 'main' ]);
});

test.only('collection can be created', assert => {
  let collection = db.collection('ducks');
  assert.ok(Ducks.detectInstance(collection));
  assert.ok(collection.constructor.__sofa_type__ === 'collection');
  assert.ok(collection.constructor.modelName === 'ducks');
});

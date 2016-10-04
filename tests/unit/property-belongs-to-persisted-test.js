import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, belongsTo } from 'sofa';

let store;
let db;

let Duck = Model.extend({
  id: prefix(),
  house: belongsTo('house')
});

let House = Model.extend({
  id: prefix()
});

module('property-belongs-to-persisted', () => {
  registerModels({ Duck, House });
  store = createStore();
  db = store.get('db.main');
  db.set('modelNames', [ 'duck', 'house' ]);
  return cleanup(store, [ 'main' ]);
});

test('serialize relationship', assert => {
  let house = db.model('house', { id: 'big' });
  let duck = db.model('duck', { id: 'yellow', house });
  assert.deepEqual(duck.serialize(), {
    "_id": "duck:yellow",
    "type": "duck",
    "house": "house:big"
  });
});

test('deserialize relationship', assert => {
  let model = db.push({ _id: 'duck:yellow', type: 'duck', house: 'house:big' });
  assert.deepEqual(model.serialize(), {
    "_id": "duck:yellow",
    "type": "duck",
    "house": "house:big"
  });
  assert.ok(db.existing('house', 'big'));
});
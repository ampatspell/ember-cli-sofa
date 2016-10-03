import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, belongsTo } from 'sofa';

let store;
let db;

let Duck = Model.extend({
  id: prefix(),
  house: belongsTo('house', { inverse: 'duck' })
});

let House = Model.extend({
  id: prefix(),
  duck: belongsTo('duck', { inverse: 'house', persist: false })
});

module('property-belongs-to-persisted-inverse', () => {
  registerModels({ Duck, House });
  store = createStore();
  db = store.get('db.main');
  db.set('modelNames', [ 'duck', 'house' ]);
  return cleanup(store, [ 'main' ]);
});

test('serialize persist:false relationship', assert => {
  let duck = db.model('duck', { id: 'yellow' });
  let house = db.model('house', { id: 'big', duck });
  assert.deepEqual(house.serialize(), {
    "_id": "house:big",
    "type": "house"
  });
});

test('set sets inverse', assert => {
  let duck = db.model('duck');
  let house = db.model('house');
  duck.set('house', house);
  assert.ok(duck.get('house') === house);
  assert.ok(house.get('duck') === duck);
});

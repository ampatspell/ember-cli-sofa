import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, hasOne, hasMany } from 'sofa';

let store;
let db;

let Duck = Model.extend({
  id: prefix(),
  house: hasOne('house', { inverse: 'ducks' })
});

let House = Model.extend({
  id: prefix(),
  ducks: hasMany('duck', { inverse: 'house' })
});

module('deleted-relationship-test', () => {
  registerModels({ Duck, House });
  store = createStore();
  db = store.get('db.main');
  db.set('modelNames', [ 'duck', 'house' ]);
  return cleanup(store, [ 'main' ]);
});

test('deserialize deleted belongsTo', assert => {
  db.push({ _id: 'house:big', type: 'house' });
  db.push({ _id: 'house:big', _deleted: true });

  let duck = db.push({ _id: 'duck:yellow', type: 'duck', house: 'house:big' });
  assert.ok(duck.get('house') === null);
});

test('deserialize deleted hasMany item', assert => {
  db.push({ _id: 'duck:yellow', type: 'duck' });
  db.push({ _id: 'duck:yellow', _deleted: true });
  let house = db.push({ _id: 'house:big', type: 'house', ducks: [ 'duck:yellow', 'duck:green' ] });

  assert.deepEqual(house.get('ducks').mapBy('id'), [ 'green' ]);

  let green = db.existing('duck', 'green');
  let yellow = db.existing('duck', 'yellow', { deleted: true });

  assert.ok(green.get('house') === house);
  assert.ok(yellow.get('house') === null);
});

test('serialize deleted belongsTo', assert => {
  let house = db.push({ _id: 'house:big', type: 'house' });
  let duck = db.push({ _id: 'duck:yellow', type: 'duck' });

  db.push({ _id: 'house:big', _deleted: true });
  assert.ok(duck.get('house') === null);

  duck.set('house', house);
  assert.ok(duck.get('house') === house);

  assert.deepEqual(duck.serialize(), {
    "_id": "duck:yellow",
    "house": null,
    "type": "duck"
  });

  db.push({ _id: 'house:big', type: 'house', ducks: [ 'duck:yellow' ] });

  assert.deepEqual(duck.serialize(), {
    "_id": "duck:yellow",
    "house": "house:big",
    "type": "duck"
  });
});

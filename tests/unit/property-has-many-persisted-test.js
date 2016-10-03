import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, belongsTo, hasMany } from 'sofa';

let store;
let db;

let Duck = Model.extend({
  id: prefix(),
  house: belongsTo('house', { inverse: 'ducks' })
});

let House = Model.extend({
  id: prefix(),
  ducks: hasMany('duck', { inverse: 'house' })
});

module('property-has-many-persisted', () => {
  registerModels({ Duck, House });
  store = createStore();
  db = store.get('db.main');
  db.set('modelNames', [ 'duck', 'house' ]);
  return cleanup(store, [ 'main' ]);
});

test('push remove', assert => {
  let yellow = db.model('duck', { id: 'yellow' });
  let red = db.model('duck', { id: 'red' });
  let house = db.model('house', { id: 'big' });

  assert.ok(red.get('house') === null);
  assert.ok(yellow.get('house') === null);

  house.get('ducks').pushObject(red);
  assert.ok(red.get('house') === house);
  assert.ok(yellow.get('house') === null);

  house.get('ducks').pushObject(yellow);
  assert.ok(red.get('house') === house);
  assert.ok(yellow.get('house') === house);

  assert.deepEqual(house.get('ducks').mapBy('docId'), [ 'duck:red', 'duck:yellow' ]);
  assert.deepEqual(house.get('ducks.content').map(internal => {
    return internal.docId;
  }), [ 'duck:red', 'duck:yellow' ]);

  house.get('ducks').removeObject(yellow);
  assert.ok(red.get('house') === house);
  assert.ok(yellow.get('house') === null);
});

test('set inverse adds/removes', assert => {
  let yellow = db.model('duck', { id: 'yellow' });
  let red = db.model('duck', { id: 'red' });
  let big = db.model('house', { id: 'big' });
  let small = db.model('house', { id: 'small' });

  red.set('house', big);

  assert.ok(yellow.get('house') === null);
  assert.ok(red.get('house') === big);
  assert.deepEqual(big.get('ducks').mapBy('id'), [ 'red' ]);
  assert.deepEqual(small.get('ducks').mapBy('id'), []);

  red.set('house', small);

  assert.ok(yellow.get('house') === null);
  assert.ok(red.get('house') === small);
  assert.deepEqual(big.get('ducks').mapBy('id'), []);
  assert.deepEqual(small.get('ducks').mapBy('id'), [ 'red' ]);

  small.get('ducks').pushObject(yellow);

  assert.ok(yellow.get('house') === small);
  assert.ok(red.get('house') === small);
  assert.deepEqual(big.get('ducks').mapBy('id'), []);
  assert.deepEqual(small.get('ducks').mapBy('id'), [ 'red', 'yellow' ]);
});

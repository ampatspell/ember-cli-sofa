import Ember from 'ember';
import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, belongsTo, hasMany } from 'sofa';

const {
  RSVP: { all }
} = Ember;

let store;
let db;

let Duck = Model.extend({
  id: prefix(),
  houses: hasMany('house', { inverse: 'ducks' })
});

let House = Model.extend({
  id: prefix(),
  ducks: hasMany('duck', { inverse: 'houses' })
});

module('property-has-many-to-has-many', () => {
  registerModels({ Duck, House });
  store = createStore();
  db = store.get('db.main');
  db.set('modelNames', [ 'duck', 'house' ]);
  return cleanup(store, [ 'main' ]);
});

test('add remove updates inverse', assert => {
  let yellow = db.model('duck', { id: 'yellow' });
  let green  = db.model('duck', { id: 'green' });
  let big    = db.model('house', { id: 'big' });
  let small  = db.model('house', { id: 'small' });

  big.get('ducks').pushObject(yellow);
  small.get('ducks').pushObject(yellow);

  assert.deepEqual(big.get('ducks').mapBy('id'), [ 'yellow' ]);
  assert.deepEqual(small.get('ducks').mapBy('id'), [ 'yellow' ]);
  assert.deepEqual(yellow.get('houses').mapBy('id'), [ 'big', 'small' ]);
  assert.deepEqual(green.get('houses').mapBy('id'), []);

  yellow.get('houses').removeObject(small);

  assert.deepEqual(big.get('ducks').mapBy('id'), [ 'yellow' ]);
  assert.deepEqual(small.get('ducks').mapBy('id'), []);
  assert.deepEqual(yellow.get('houses').mapBy('id'), [ 'big' ]);
  assert.deepEqual(green.get('houses').mapBy('id'), []);

  green.get('houses').pushObjects([ big, small ]);

  assert.deepEqual(big.get('ducks').mapBy('id'), [ 'yellow', 'green' ]);
  assert.deepEqual(small.get('ducks').mapBy('id'), [ 'green' ]);
  assert.deepEqual(yellow.get('houses').mapBy('id'), [ 'big' ]);
  assert.deepEqual(green.get('houses').mapBy('id'), [ 'big', 'small' ]);
});

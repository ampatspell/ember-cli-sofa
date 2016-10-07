import Ember from 'ember';
import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, hasMany } from 'sofa';

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

module('has-many-to-has-many', () => {
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

test('save', assert => {
  let yellow = db.model('duck', { id: 'yellow' });
  let green  = db.model('duck', { id: 'green' });
  let big    = db.model('house', { id: 'big' });
  let small  = db.model('house', { id: 'small' });

  big.get('ducks').pushObjects([ yellow, green ]);
  small.get('ducks').pushObject(green);

  return all([ yellow, green, big, small ].map(model => model.save())).then(() => {
    return db.get('documents.mango').find({ selector: { type: { $gt: null } }});
  }).then(json => {
    assert.deepEqual_(json.docs, [
      {
        "_id": "duck:green",
        "_rev": "ignored",
        "houses": [
          "house:big",
          "house:small"
        ],
        "type": "duck"
      },
      {
        "_id": "duck:yellow",
        "_rev": "ignored",
        "houses": [
          "house:big"
        ],
        "type": "duck"
      },
      {
        "_id": "house:big",
        "_rev": "ignored",
        "ducks": [
          "duck:yellow",
          "duck:green"
        ],
        "type": "house"
      },
      {
        "_id": "house:small",
        "_rev": "ignored",
        "ducks": [
          "duck:green"
        ],
        "type": "house"
      }
    ]);
  });
});

test('load', assert => {
  db.push({
    "_id": "duck:green",
    "_rev": "ignored",
    "houses": [
      "house:big",
      "house:small"
    ],
    "type": "duck"
  });

  assert.deepEqual(db.existing('duck', 'green').get('houses').mapBy('id'), [ 'big', 'small' ]);
  assert.deepEqual(db.existing('house', 'big').get('ducks').mapBy('id'), [ 'green' ]);
  assert.deepEqual(db.existing('house', 'small').get('ducks').mapBy('id'), [ 'green' ]);

  db.push({
    "_id": "duck:yellow",
    "_rev": "ignored",
    "houses": [
      "house:big"
    ],
    "type": "duck"
  });

  assert.deepEqual(db.existing('duck', 'green').get('houses').mapBy('id'), [ 'big', 'small' ]);
  assert.deepEqual(db.existing('duck', 'yellow').get('houses').mapBy('id'), [ 'big' ]);
  assert.deepEqual(db.existing('house', 'big').get('ducks').mapBy('id'), [ 'green', 'yellow' ]);
  assert.deepEqual(db.existing('house', 'small').get('ducks').mapBy('id'), [ 'green' ]);

  db.push({
    "_id": "house:big",
    "_rev": "ignored",
    "ducks": [
      "duck:yellow"
    ],
    "type": "house"
  });

  assert.deepEqual(db.existing('duck', 'green').get('houses').mapBy('id'), [ 'small' ]);
  assert.deepEqual(db.existing('duck', 'yellow').get('houses').mapBy('id'), [ 'big' ]);
  assert.deepEqual(db.existing('house', 'big').get('ducks').mapBy('id'), [ 'yellow' ]);
  assert.deepEqual(db.existing('house', 'small').get('ducks').mapBy('id'), [ 'green' ]);

  db.push({
    "_id": "house:small",
    "_rev": "ignored",
    "ducks": [
      "duck:green",
      "duck:yellow"
    ],
    "type": "house"
  });

  assert.deepEqual(db.existing('duck', 'green').get('houses').mapBy('id'), [ 'small' ]);
  assert.deepEqual(db.existing('duck', 'yellow').get('houses').mapBy('id'), [ 'big', 'small' ]);
  assert.deepEqual(db.existing('house', 'big').get('ducks').mapBy('id'), [ 'yellow' ]);
  assert.deepEqual(db.existing('house', 'small').get('ducks').mapBy('id'), [ 'green', 'yellow' ]);

  db.push({
    "_id": "house:small",
    "_rev": "ignored",
    "ducks": [
      "duck:green"
    ],
    "type": "house"
  });

  assert.deepEqual(db.existing('duck', 'green').get('houses').mapBy('id'), [ 'small' ]);
  assert.deepEqual(db.existing('duck', 'yellow').get('houses').mapBy('id'), [ 'big' ]);
  assert.deepEqual(db.existing('house', 'big').get('ducks').mapBy('id'), [ 'yellow' ]);
  assert.deepEqual(db.existing('house', 'small').get('ducks').mapBy('id'), [ 'green' ]);
});


test('deleted hasMany model is removed from hasMany', assert => {
  let yellow = db.model('duck', { id: 'yellow' });
  let red = db.model('duck', { id: 'red' });
  let big = db.model('house', { id: 'big', ducks: [ yellow, red ] });

  return all([ yellow, red, big ].map(model => model.save())).then(() => {
    return big.delete();
  }).then(() => {
    assert.deepEqual(yellow.get('_internal').values.houses.content.map(internal => internal.docId), []);
    assert.deepEqual(red.get('_internal').values.houses.content.map(internal => internal.docId), []);
  });
});

test('deleted hasMany model is removed from hasMany with inverse proxies', assert => {
  let yellow = db.model('duck', { id: 'yellow' });
  let red = db.model('duck', { id: 'red' });
  let big = db.model('house', { id: 'big', ducks: [ yellow, red ] });

  yellow.get('houses');
  red.get('houses');

  return all([ yellow, red, big ].map(model => model.save())).then(() => {
    return big.delete();
  }).then(() => {
    assert.deepEqual(yellow.get('houses').map(model => model.get('docId')), []);
    assert.deepEqual(red.get('houses').map(model => model.get('docId')), []);
  });
});

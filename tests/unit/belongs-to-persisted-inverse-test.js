import Ember from 'ember';
import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, belongsTo } from 'sofa';

const {
  RSVP: { all, hash }
} = Ember;

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

module('belongs-to-persisted-inverse', () => {
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
  let duck = db.model('duck', { id: 'duck' });
  let house = db.model('house', { id: 'house' });
  duck.set('house', house);
  assert.ok(duck.get('house') === house);
  assert.ok(house.get('duck') === duck);
});

test('set sets inverse and unsets', assert => {
  let duck = db.model('duck', { id: 'duck' });
  let house = db.model('house', { id: 'house' });

  duck.set('house', house);
  assert.ok(duck.get('house') === house);
  assert.ok(house.get('duck') === duck);

  duck.set('house');
  assert.ok(duck.get('house') === null);
  assert.ok(house.get('duck') === null);

  house.set('duck', duck);
  assert.ok(duck.get('house') === house);
  assert.ok(house.get('duck') === duck);
});

test('save', assert => {
  let duck = db.model('duck', { id: 'duck' });
  let house = db.model('house', { id: 'house', duck });
  return all([ duck.save(), house.save() ]).then(() => {
    return hash({
      duck: db.get('documents').load('duck:duck'),
      house: db.get('documents').load('house:house')
    });
  }).then(hash => {
    assert.deepEqual_(hash, {
      "duck": {
        "_id": "duck:duck",
        "_rev": "ignored",
        "house": "house:house",
        "type": "duck"
      },
      "house": {
        "_id": "house:house",
        "_rev": "ignored",
        "type": "house"
      }
    });
  });
});

test('load', assert => {
  return all([
    db.get('documents').save({ _id: 'duck:duck', type: 'duck', house: 'house:house' }),
    db.get('documents').save({ _id: 'house:house', type: 'house' })
  ]).then(() => {
    return db.find({ model: 'duck', id: 'duck' });
  }).then(duck => {
    assert.ok(db.existing('duck', 'duck'));
    assert.ok(db.existing('house', 'house'));

    assert.deepEqual(db.existing('duck', 'duck').get('state'), {
      "error": null,
      "isDeleted": false,
      "isDirty": false,
      "isError": false,
      "isLoaded": true,
      "isLoading": false,
      "isNew": false,
      "isSaving": false
    });

    assert.deepEqual(db.existing('house', 'house').get('state'), {
      "error": null,
      "isDeleted": false,
      "isDirty": false,
      "isError": false,
      "isLoaded": false,
      "isLoading": false,
      "isNew": false,
      "isSaving": false
    });

    assert.deepEqual_(duck.serialize(), {
      "_id": "duck:duck",
      "_rev": "ignored",
      "house": "house:house",
      "type": "duck"
    });
  });
});

test('delete unsets inverse', assert => {
  let duck = db.model('duck', { id: 'duck' });
  let house = db.model('house', { id: 'house', duck });
  return all([ duck.save(), house.save() ]).then(() => {
    return duck.delete();
  }).then(() => {
    assert.ok(duck.get('house') === house);
    assert.ok(house.get('duck') === null);
  });
});

test('delete detached unsets self', assert => {
  let duck = db.model('duck', { id: 'duck' });
  let house = db.model('house', { id: 'house', duck });
  return all([ duck.save(), house.save() ]).then(() => {
    return duck.delete();
  }).then(() => {
    assert.ok(duck.get('house') === house);
    assert.ok(house.get('duck') === null);
    return house.delete();
  }).then(() => {
    assert.ok(duck.get('house') === null);
    assert.ok(house.get('duck') === null);
  });
});

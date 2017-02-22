import Ember from 'ember';
import { configurations, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, belongsTo, hasMany } from 'sofa';

const {
  RSVP: { all }
} = Ember;

configurations(({ module, test, createStore }) => {

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

  test('set value', assert => {
    let yellow = db.model('duck', { id: 'yellow' });
    let red = db.model('duck', { id: 'red' });
    let big = db.model('house', { id: 'big', ducks: [ yellow, red ] });
    assert.deepEqual(big.get('ducks').mapBy('id'), [ 'yellow', 'red' ]);
  });

  test('save', assert => {
    let yellow = db.model('duck', { id: 'yellow' });
    let red = db.model('duck', { id: 'red' });
    let big = db.model('house', { id: 'big', ducks: [ yellow, red ] });
    return big.save().then(() => {
      return db.get('documents').load('house:big');
    }).then(doc => {
      assert.deepEqual_(doc, {
        "_id": "house:big",
        "_rev": "ignored",
        "ducks": [
          "duck:yellow",
          "duck:red"
        ],
        "type": "house"
      });
    });
  });

  test('load', assert => {
    let big = db.push({
      "_id": "house:big",
      "_rev": "ignored",
      "ducks": [
        "duck:yellow",
        "duck:red"
      ],
      "type": "house"
    });

    assert.ok(big);
    assert.deepEqual(big.get('ducks').mapBy('id'), [ 'yellow', 'red' ]);

    let yellow = db.existing('duck', 'yellow');
    let red = db.existing('duck', 'red');

    assert.ok(yellow);
    assert.ok(red);

    assert.ok(yellow.get('house') === big);
    assert.ok(red.get('house') === big);
  });

  test('load while proxy is present', assert => {
    let green = db.existing('duck', 'green', { create: true });
    let yellow = db.existing('duck', 'yellow', { create: true });
    let big = db.existing('house', 'big', { create: true });

    big.get('ducks').pushObject(yellow);
    big.get('ducks').pushObject(green);
    assert.deepEqual(big.get('ducks').mapBy('id'), [ 'yellow', 'green' ]);

    big = db.push({
      "_id": "house:big",
      "_rev": "ignored",
      "ducks": [
        "duck:yellow",
        "duck:red"
      ],
      "type": "house"
    });

    assert.ok(big);
    assert.deepEqual(big.get('ducks').mapBy('id'), [ 'yellow', 'red' ]);

    let red = db.existing('duck', 'red');

    assert.ok(yellow);
    assert.ok(red);

    assert.ok(yellow.get('house') === big);
    assert.ok(red.get('house') === big);
    assert.ok(green.get('house') === null);
  });

  test('deleted model is removed from array', assert => {
    let yellow = db.model('duck', { id: 'yellow' });
    let red = db.model('duck', { id: 'red' });
    let big = db.model('house', { id: 'big', ducks: [ yellow, red ] });
    return all([ yellow.save(), red.save(), big.save() ]).then(() => {
      assert.deepEqual(big.get('ducks').mapBy('id'), [ 'yellow', 'red' ]);
      return yellow.delete();
    }).then(() => {
      assert.deepEqual(big.get('ducks').mapBy('id'), [ 'red' ]);
      assert.ok(yellow.get('house') === big);
    });
  });

  test('deleted model is removed from array when relation doesnt have proxy', assert => {
    let yellow = db.model('duck', { id: 'yellow' });
    let red = db.model('duck', { id: 'red' });
    let big = db.model('house', { id: 'big', ducks: [ yellow, red ] });

    assert.ok(yellow.get('house') === big);
    assert.ok(red.get('house') === big);

    let relation = big.get('_internal').values.ducks;

    return all([ yellow.save(), red.save(), big.save() ]).then(() => {
      assert.deepEqual(relation.content.map(internal => internal.docId), [ "duck:yellow", "duck:red" ]);
      assert.ok(!relation.value);
      assert.ok(yellow.get('house') === big);
      assert.ok(red.get('house') === big);
      return yellow.delete();
    }).then(() => {
      assert.deepEqual(relation.content.map(internal => internal.docId), [ "duck:red" ]);
      assert.ok(!relation.value);
      assert.ok(yellow.get('house') === big);
      assert.ok(red.get('house') === big);
    });
  });

  test('deleted model with has many removes self from content items (no proxy)', assert => {
    let yellow = db.model('duck', { id: 'yellow' });
    let red = db.model('duck', { id: 'red' });
    let big = db.model('house', { id: 'big', ducks: [ yellow, red ] });

    let relation = big.get('_internal').values.ducks;

    return all([ yellow.save(), red.save(), big.save() ]).then(() => {
      assert.ok(!relation.value);
      assert.ok(yellow.get('house') === big);
      assert.ok(red.get('house') === big);
      return big.delete();
    }).then(() => {
      assert.ok(!relation.value);
      assert.deepEqual(relation.content.map(internal => internal.docId), [ "duck:yellow", "duck:red" ]);
      assert.ok(yellow.get('house') === null);
      assert.ok(red.get('house') === null);
    });
  });

  test('deleted model with has many removes self from content items (has proxy)', assert => {
    let yellow = db.model('duck', { id: 'yellow' });
    let red = db.model('duck', { id: 'red' });
    let big = db.model('house', { id: 'big', ducks: [ yellow, red ] });

    let relation = big.get('_internal').values.ducks;
    big.get('ducks');
    assert.ok(relation.value);

    return all([ yellow.save(), red.save(), big.save() ]).then(() => {
      assert.ok(yellow.get('house') === big);
      assert.ok(red.get('house') === big);
      return big.delete();
    }).then(() => {
      assert.deepEqual(relation.content.map(internal => internal.docId), [ "duck:yellow", "duck:red" ]);
      assert.ok(yellow.get('house') === null);
      assert.ok(red.get('house') === null);
    });
  });

});

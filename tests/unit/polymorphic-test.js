import { configurations, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, belongsTo, hasMany } from 'sofa';

configurations({ only: '1.6' }, ({ module, test, createStore }) => {

  let store;
  let db;

  let Duck = Model.extend({
    id: prefix(),
    house: belongsTo('house', { inverse: 'ducks', polymorphic: true })
  });

  let House = Model.extend({
    id: prefix(),
    ducks: hasMany('duck', { inverse: 'house', polymorphic: true })
  });

  let NiceHouse = House.extend({
    id: prefix('house:'),
  });

  let YellowDuck = Duck.extend({
    id: prefix('duck:'),
  });

  module('polymorphic', () => {
    registerModels({ Duck, House, NiceHouse, YellowDuck });
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'duck', 'house', 'nice-house', 'yellow-duck' ]);
    return cleanup(store, [ 'main' ]);
  });

  test('serialize belongsTo', assert => {
    let duck = db.model('duck', { id: 'yellow' });
    let house = db.model('house', { id: 'big' });
    duck.set('house', house);
    assert.deepEqual(duck.serialize(), {
      "_attachments": {},
      "_id": "duck:yellow",
      "house": {
        "id": "house:big",
        "type": "house"
      },
      "type": "duck"
    });
  });

  test('serialize hasMany', assert => {
    let duck = db.model('duck', { id: 'yellow' });
    let house = db.model('house', { id: 'big' });
    duck.set('house', house);
    assert.deepEqual(house.serialize(), {
      "_attachments": {},
      "_id": "house:big",
      "ducks": [
        {
          "id": "duck:yellow",
          "type": "duck"
        }
      ],
      "type": "house"
    });
  });

  test('deserialize belongsTo', assert => {
    db.push({ _id: 'duck:yellow', type: 'duck', house: { id: 'house:big', type: 'house' } });
    assert.ok(db.existing('house', 'big'));
  });

  test('deserialize belongsTo descendant', assert => {
    db.push({ _id: 'duck:yellow', type: 'duck', house: { id: 'house:big', type: 'nice-house' } });
    assert.ok(db.existing('house', 'big').get('modelName') === 'nice-house');
  });

  test('deserialize hasMany descendant', assert => {
    db.push({ _id: 'house:big', type: 'house', ducks: [ { id: 'duck:yellow', type: 'yellow-duck' } ] });
    assert.ok(db.existing('duck', 'yellow').get('modelName') === 'yellow-duck');
  });

});

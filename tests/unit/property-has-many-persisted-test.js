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

test('hello', assert => {
  let yellow = db.model('duck', { id: 'yellow' });
  let red = db.model('duck', { id: 'red' });
  let house = db.model('house', { id: 'big' });
  house.get('ducks').pushObject(red);
  house.get('ducks').pushObject(yellow);
  assert.ok(house.get('ducks').mapBy('docId'), [ 'duck:red', 'duck:yellow' ]);
});

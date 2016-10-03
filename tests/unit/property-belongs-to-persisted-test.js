import Ember from 'ember';
import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, attr } from 'sofa';

const {
  RSVP: { all }
} = Ember;

let store;
let db;

let Duck = Model.extend({
  id: prefix()
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

test('hello', assert => {
  let duck = db.model('duck', { id: 'yellow' });
  let house = db.model('house', { id: 'big' });
  return all([ duck.save(), house.save() ]).then(() => {

  });
});

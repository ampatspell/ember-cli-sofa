import Ember from 'ember';
import { module, test, createStore, registerModels } from '../helpers/setup';
import { Model, prefix, type, attr } from 'sofa';

const {
  get
} = Ember;

let store;
let db;

let Duck = Model.extend({

  id: prefix(),
  type: type('the-duck'),
  name: attr('string'),
  age: attr('integer'),

});

module('model-deserialize', () => {
  registerModels({ Duck });
  store = createStore();
  db = store.get('db.main');
});

test('deserialize', assert => {
  let model = db.model('duck');
  let internal = model.get('_internal');
  let definition = get(model.constructor, 'definition');

  definition.deserialize(internal, {
    "_id": "duck:yellow",
    "age": "10",
    "name": "Yellow Duck",
    "type": "the-duck"
  });

  assert.deepEqual(Ember.copy(model.get('_internal').values), {
    "age": 10,
    "id": "yellow",
    "name": "Yellow Duck",
    "type": "the-duck"
  });

  assert.deepEqual(model.serialize(), {
    "_id": "duck:yellow",
    "age": 10,
    "name": "Yellow Duck",
    "type": "the-duck"
  });
});

test('deserialize and serialize keeps additional doc props', assert => {
  let model = db.model('duck');
  let internal = model.get('_internal');
  let definition = get(model.constructor, 'definition');

  definition.deserialize(internal, {
    "_id": "duck:yellow",
    "age": "10",
    "name": "Yellow Duck",
    "type": "the-duck",
    "additional": true,
    "obj": { ok: true }
  });

  assert.deepEqual(Ember.copy(model.get('_internal').values), {
    "age": 10,
    "id": "yellow",
    "name": "Yellow Duck",
    "type": "the-duck"
  });

  assert.deepEqual(model.serialize(), {
    "_id": "duck:yellow",
    "age": 10,
    "name": "Yellow Duck",
    "type": "the-duck",
    "additional": true,
    "obj": { ok: true }
  });
});

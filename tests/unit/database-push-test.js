import Ember from 'ember';
import { module, test, createStore, registerModels } from '../helpers/setup';
import { Model, prefix, attr } from 'sofa';

const {
  RSVP: { resolve }
} = Ember;

let store;
let db;

let Duck = Model.extend({
  id: prefix('the-duck:'),
  name: attr('string'),
});

let Fish = Model.extend({
});

module('database-push', () => {
  registerModels({ Duck, Fish });
  store = createStore();
  db = store.get('db.main');
  db.set('modelNames', [ 'duck', 'fish' ]);
});

test('deserialize without expected model name', assert => {
  let model = db.push({ _id: 'the-duck:yellow', type: 'duck', name: 'Yellow Duck' });
  assert.ok(model);
});

test('deserialize wrong type', assert => {
  db.push({ _id: 'the-duck:yellow', type: 'duck', name: 'Yellow Duck' });
  return resolve().then(() => {
    db.push({ _id: 'the-duck:yellow', type: 'fish', name: 'Yellow Duck' });
  }).then(() => {
    assert.ok(false, 'should reject');
  }, err => {
    assert.deepEqual(err.toJSON(), {
      "error": "inivalid_document",
      "reason": "document 'the-duck:yellow' is expected to be 'duck' not 'fish'"
    });
  });
});

test('deserialize wrong expected modelClass', assert => {
  return resolve().then(() => {
    db.push({ _id: 'the-duck:yellow', type: 'duck', name: 'Yellow Duck' }, 'fish', false);
  }).then(() => {
    assert.ok(false, 'should reject');
  }, err => {
    assert.deepEqual(err.toJSON(), {
      "error": "invalid_document",
      "reason": "document 'the-duck:yellow' is expected to be 'fish' not 'duck'"
    });
  });
});

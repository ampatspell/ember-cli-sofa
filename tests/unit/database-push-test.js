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
  let model = db.push({ _id: 'the-duck:yellow', _rev: '1-asd', type: 'duck', name: 'Yellow Duck' });
  assert.deepEqual(model.get('state'), {
    "error": null,
    "isDeleted": false,
    "isDirty": false,
    "isError": false,
    "isLoaded": true,
    "isLoading": false,
    "isNew": false,
    "isSaving": false
  });
  assert.deepEqual(model.getProperties('id', 'rev', 'type', 'name'), {
    "id": "yellow",
    "name": "Yellow Duck",
    "rev": "1-asd",
    "type": "duck"
  });
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
    db.push({ _id: 'the-duck:yellow', type: 'duck', name: 'Yellow Duck' }, { model: 'fish', optional: false });
  }).then(() => {
    assert.ok(false, 'should reject');
  }, err => {
    assert.deepEqual(err.toJSON(), {
      "error": "invalid_document",
      "reason": "document 'the-duck:yellow' is expected to be 'fish' not 'duck'"
    });
  });
});

test('push deleted with known doc', assert => {
  let model = db.push({ _id: 'the-duck:yellow', type: 'duck', name: 'Yellow Duck' });
  let got = db.push({ _id: 'the-duck:yellow', _deleted: true });
  assert.ok(model === got);
  assert.ok(got);
  assert.deepEqual(model.get('state'), {
    "error": null,
    "isDeleted": true,
    "isDirty": false,
    "isError": false,
    "isLoaded": true,
    "isLoading": false,
    "isNew": false,
    "isSaving": false
  });
  assert.ok(db.get('_modelIdentity').deleted['the-duck:yellow']);
  assert.ok(!db.get('_modelIdentity').saved['the-duck:yellow']);
  assert.ok(db.get('_modelIdentity').all.length === 0);
});

test('push deleted with unknown doc', assert => {
  let model = db.push({ _id: 'the-duck:yellow', _deleted: true });
  assert.ok(!model);
});

test('ressurect deleted', assert => {
  db.push({ _id: 'the-duck:yellow', type: 'duck' });
  db.push({ _id: 'the-duck:yellow', _deleted: true });
  let model = db.push({ _id: 'the-duck:yellow', type: 'duck', name: 'Yellow Duck' });
  assert.ok(model);
  assert.deepEqual(model.get('state'), {
    "error": null,
    "isDeleted": false,
    "isDirty": false,
    "isError": false,
    "isLoaded": true,
    "isLoading": false,
    "isNew": false,
    "isSaving": false
  });
  assert.ok(!db.get('_modelIdentity').deleted['the-duck:yellow']);
  assert.ok(db.get('_modelIdentity').saved['the-duck:yellow']);
  assert.ok(db.get('_modelIdentity').all[0].docId === 'the-duck:yellow');
});

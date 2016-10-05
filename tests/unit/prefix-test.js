import Ember from 'ember';
import { module, test, createStore, registerModels } from '../helpers/setup';
import { Model, prefix } from 'sofa';

const {
  RSVP: { resolve }
} = Ember;

let store;
let db;

let Duck = Model.extend({

  id: prefix(),

});

module('prefix', () => {
  registerModels({ Duck });
  store = createStore();
  db = store.get('db.main');
  db.set('modelNames', [ 'duck' ]);
});

test('create with value', assert => {
  let model = db.model('duck', { id: 'yellow' });
  assert.ok(model.get('id') === 'yellow');
  assert.ok(model.get('docId') === 'duck:yellow');

  model.set('id', 'green');

  assert.ok(model.get('id') === 'green');
  assert.ok(model.get('docId') === 'duck:green');
});

test('cannot change after save', assert => {
  let model = db.model('duck', { id: 'yellow' });
  model.set('id', 'green');
  assert.ok(model.get('id') === 'green');
  assert.ok(model.get('docId') === 'duck:green');

  model.get('_internal').state.isNew = false;

  model.set('id', 'foof');
  assert.ok(model.get('id') === 'green');
  assert.ok(model.get('docId') === 'duck:green');
});

test('push with wrong prefixed id', assert => {
  return resolve().then(() => {
    db.push({ _id: 'foof:yellow', type: 'duck', name: 'Yellow Duck' }, 'duck', false);
  }).then(() => {
    assert.ok(false, 'should reject');
  }, err => {
    assert.deepEqual(err.toJSON(), {
      "error": "invalid_document",
      "reason": "document _id 'foof:yellow' must have 'duck:' prefix"
    });
  });
});

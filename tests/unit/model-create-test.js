import Ember from 'ember';
import { module, test, createStore, registerModels } from '../helpers/setup';
import { Model, attr } from 'sofa';

const {
  RSVP: { resolve }
} = Ember;

let store;
let db;

let Duck = Model.extend({

  name: attr('string'),

});

module('model-create', () => {
  registerModels({ Duck });
  store = createStore();
  db = store.get('db.main');
});

test('can be created', assert => {
  let duck = db.model('duck');
  assert.ok(duck);
});

test('model created with database', assert => {
  let duck = db.model('duck');
  assert.ok(duck.get('database') === db);
});

test('model created without database', assert => {
  let duck = store.model('duck');
  assert.ok(duck.get('database') === null);
});

test('model isNew can set database', assert => {
  let duck = store.model('duck');
  assert.ok(duck.get('isNew'));
  duck.set('database', db);
  assert.ok(duck.get('database') === db);
});

test('model isNew:false cannot set database', assert => {
  return resolve().then(() => {
    let duck = store.model('duck');
    duck.get('_internal').state.isNew = false;
    duck.set('database', db);
  }).then(() => {
    assert.ok(false, 'should reject');
  }, err => {
    assert.deepEqual(err.toJSON(), {
      "error": "internal",
      "reason": "Database can be set only while model is new"
    });
  });
});

test('model is created state isNew', assert => {
  let model = db.model('duck', { name: 'Yellow' });
  assert.deepEqual(model.get('state'), {
    "error": null,
    "isDeleted": false,
    "isDirty": true,
    "isError": false,
    "isLoaded": false,
    "isLoading": false,
    "isNew": true,
    "isSaving": false
  });
});

test('model is created with declared props', assert => {
  let model = db.model('duck', { name: 'Yellow' });
  assert.equal(model.get('name'), 'Yellow');
  assert.equal(model.get('isDirty'), true);
});

test('model is created with declared and additional props', assert => {
  let model = db.model('duck', { name: 'Yellow', email: 'yellow@duck.com' });
  assert.equal(model.get('name'), 'Yellow');
  assert.equal(model.get('email'), 'yellow@duck.com');
  assert.equal(model.get('isDirty'), true);
});

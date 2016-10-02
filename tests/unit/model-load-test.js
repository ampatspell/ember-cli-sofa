import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, attr } from 'sofa';

let store;
let db;

let Duck = Model.extend({

  id: prefix(),
  name: attr('string'),

});

module('model-load', () => {
  registerModels({ Duck });
  store = createStore();
  db = store.get('db.main');
  return cleanup(store, [ 'main' ]);
});

test('load missing model', assert => {
  let model = db.existing('duck', 'deleted', { create: true });
  assert.deepEqual(model.get('state'), {
    "error": null,
    "isDeleted": false,
    "isDirty": false,
    "isError": false,
    "isLoaded": false,
    "isLoading": false,
    "isNew": false,
    "isSaving": false
  });

  return model.load().then(() => {
    assert.ok(false, 'should reject');
  }, err => {
    assert.deepEqual(err.toJSON(), {
      "error": "not_found",
      "reason": "missing",
      "status": 404
    });
    assert.deepEqual(model.get('state'), {
      "error": err,
      "isDeleted": true,
      "isDirty": false,
      "isError": true,
      "isLoaded": true,
      "isLoading": false,
      "isNew": false,
      "isSaving": false
    });
    assert.ok(!db.existing('duck', 'deleted'));
    assert.ok(db.existing('duck', 'deleted', { deleted: true }));
  });
});

test('load existing model', assert => {
  return db.get('documents').save({ _id: 'duck:yellow', type: 'duck', name: 'Yellow one' }).then(() => {
    return db.load('duck', 'yellow');
  }).then(model => {
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
    assert.equal(model.get('name'), 'Yellow one');
    assert.ok(db.existing('duck', 'yellow'));
  });
});

test('load existing with invalid type', assert => {
  return db.get('documents').save({ _id: 'duck:yellow', type: 'fish', name: 'Yellow one' }).then(() => {
    return db.load('duck', 'yellow');
  }).then(() => {
    assert.ok(false, 'should reject');
  }, err => {
    assert.deepEqual(err.toJSON(), {
      "error": "invalid_document",
      "reason": "document 'duck:yellow' is expected to be 'duck'"
    });
  });
});

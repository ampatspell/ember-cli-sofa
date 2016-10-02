import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, attr } from 'sofa';

let store;
let db;

let Duck = Model.extend({

  id: prefix(),
  name: attr('string'),

});

module('model-delete', () => {
  registerModels({ Duck });
  store = createStore();
  db = store.get('db.main');
  return cleanup(store, [ 'main' ]);
});

test('delete model', assert => {
  return db.model('duck', { id: 'yellow' }).save().then(duck => {
    return duck.delete();
  }).then(duck => {
    assert.deepEqual(duck.get('state'), {
      "error": null,
      "isDeleted": true,
      "isDirty": false,
      "isError": false,
      "isLoaded": true,
      "isLoading": false,
      "isNew": false,
      "isSaving": false
    });
    assert.ok(!db.existing('duck', 'yellow'));
    assert.ok(db.existing('duck', 'yellow', { deleted: true }));
  });
});

test('delete already deleted', assert => {
  return db.get('documents').save({ _id: 'duck:yellow' }).then(json => {
    return db.get('documents').delete('duck:yellow', json.rev);
  }).then(data => {
    let model = db.existing('duck', 'yellow', { create: true });
    model.set('rev', data.rev);
    return model.delete();
  }).then(model => {
    assert.ok(model.get('error'));
    assert.deepEqual(model.get('state'), {
      "error": model.get('error'),
      "isDeleted": true,
      "isDirty": false,
      "isError": true,
      "isLoaded": true,
      "isLoading": false,
      "isNew": false,
      "isSaving": false
    });
    assert.ok(!db.existing('duck', 'yellow'));
    assert.ok(db.existing('duck', 'yellow', { deleted: true }));
  });
});

test('save delete save delete', assert => {
  return db.model('duck', { id: 'yellow' }).save().then(model => {
    assert.ok(db.existing('duck', 'yellow'));
    return model.delete();
  }).then(model => {
    assert.ok(!db.existing('duck', 'yellow'));
    assert.ok(db.existing('duck', 'yellow', { deleted: true }));
    return model.save();
  }).then(model => {
    assert.ok(db.existing('duck', 'yellow'));
    return model.delete();
  }).then(model => {
    assert.ok(!db.existing('duck', 'yellow'));
    assert.ok(db.existing('duck', 'yellow', { deleted: true }));
  });
});

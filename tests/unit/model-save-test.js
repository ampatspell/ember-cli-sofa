import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, attr } from 'sofa';

let store;
let db;

let Duck = Model.extend({

  id: prefix(),
  name: attr('string'),

});

module('model-create', () => {
  registerModels({ Duck });
  store = createStore();
  db = store.get('db.main');
  return cleanup(store, [ 'main' ]);
});

test('save model', assert => {
  let model = db.model('duck', { id: 'yellow', name: 'Yellow Ducky' });
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

  return model.save().then(() => {
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
    assert.ok(db.get('_modelIdentity').saved['duck:yellow']);
  });
});

test('existing model', assert => {
  assert.ok(!db.existing('duck', 'yellow'));
  return db.model('duck', { id: 'yellow' }).save().then(model => {
    assert.ok(db.existing('duck', 'yellow') === model);
  });
});

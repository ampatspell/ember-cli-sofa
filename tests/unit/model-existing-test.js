import { configurations, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, attr } from 'sofa';

configurations({ only: '1.6' }, ({ module, test, createStore }) => {

  let store;
  let db;

  let Duck = Model.extend({

    id: prefix(),
    name: attr('string'),

  });

  module('model-existing', () => {
    registerModels({ Duck });
    store = createStore();
    db = store.get('db.main');
    return cleanup(store, [ 'main' ]);
  });

  test('existing model after save', assert => {
    assert.ok(!db.existing('duck', 'yellow'));
    return db.model('duck', { id: 'yellow' }).save().then(model => {
      assert.ok(db.existing('duck', 'yellow') === model);
    });
  });

  test('existing model is created', assert => {
    let model = db.existing('duck', 'yellow', { create: true });
    assert.ok(model);
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
  });

});

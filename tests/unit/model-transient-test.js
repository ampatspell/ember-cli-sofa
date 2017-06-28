import { configurations, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, attr } from 'sofa';

configurations(({ module, test, createStore }) => {

  let store;
  let db;

  let Duck = Model.extend({

    id: prefix(),
    name: attr('string'),

  });

  module('model-transient', () => {
    registerModels({ Duck });
    store = createStore();
    db = store.get('db.main');
    return cleanup(store, [ 'main' ]);
  });

  test('create', assert => {
    let duck = db.transient('duck', 'yellow');
    assert.deepEqual(duck.get('state'), {
      "error": null,
      "isDeleted": false,
      "isDirty": false,
      "isError": false,
      "isLoaded": true,
      "isLoading": false,
      "isNew": false,
      "isSaving": false
    });
    assert.ok(duck.get('_internal').transient);
    assert.ok(db.existing('duck', 'yellow') === duck);
  });

});

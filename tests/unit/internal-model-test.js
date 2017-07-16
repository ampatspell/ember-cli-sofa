import { configurations, registerModels } from '../helpers/setup';
import Model from 'sofa/model';

configurations({ only: '1.6' }, ({ module, test, createStore }) => {

  let store;

  let Duck = Model.extend({
  });

  let create = (modelClass, db) => {
    return store._createNewInternalModel(modelClass, db);
  };

  module('internal-model', () => {
    registerModels({ Duck });
    store = createStore();
  });

  test('is created with isNew true and no database', assert => {
    let modelClass = store.modelClassForName('duck');
    let { internal } = create(modelClass);
    assert.ok(internal);
    assert.ok(internal.modelClass === modelClass);
    assert.ok(internal.database === null);
    assert.ok(internal.state.isNew === true);
  });

  test('is created with isNew true and database', assert => {
    let modelClass = store.modelClassForName('duck');
    let { internal } = create(modelClass, store.get('db.main'));
    assert.ok(internal);
    assert.ok(internal.modelClass === modelClass);
    assert.ok(internal.database === store.get('db.main'));
    assert.ok(internal.state.isNew === true);
  });

  test('internal model creates model', assert => {
    let modelClass = store.modelClassForName('duck');
    let { internal } = create(modelClass);
    let model = internal.getModel();
    assert.ok(model);
    assert.ok(model.get('_internal') === internal);
  });

  test('model is created with internal model', assert => {
    let model = store.get('db.main').model('duck', { ok: true });
    assert.ok(model);
    assert.ok(model.get('_internal.model') === model);
  });

});

import { configurations, registerModels, cleanup } from '../helpers/setup';
import { Model, attr } from 'sofa';

configurations({ only: '1.6' }, ({ module, test, createStore }) => {

  let store;
  let db;

  let TestModel = Model.extend({
    value: attr('integer'),
  });

  module('attribute-transform-integer', () => {
    registerModels({ TestModel });
    store = createStore();
    db = store.get('db.main');
    return cleanup(store, [ 'main' ]);
  });

  test('transform', (assert) => {
    let model = db.model('test-model', { value : '1' });
    assert.ok(model.get('value') === 1);

    model.set('value', 2);
    assert.ok(model.get('value') === 2);

    model.set('value', "asd");
    assert.ok(model.get('value') === null);

    model.set('value', 1.5);
    assert.ok(model.get('value') === 1);

    model.set('value', '1.5');
    assert.ok(model.get('value') === 1);

    return db.get('documents').save({ _id: 'model', value: '1', type: 'test-model' }).then(() => {
      return db.load('test-model', 'model');
    }).then(model => {
      assert.ok(model.get('value') === 1);
    });
  });

  test('save and load', assert => {
    var value = 42;
    let model = db.model('test-model', { id: 'model', value : value });
    return model.save().then(() => {
      return db.load('test-model', 'model', { force: true });
    }).then((model) => {
      assert.ok(model.get('value') === 42);
    });
  });

});

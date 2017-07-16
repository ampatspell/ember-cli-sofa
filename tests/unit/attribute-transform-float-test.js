import { configurations, registerModels, cleanup } from '../helpers/setup';
import { Model, attr } from 'sofa';

configurations({ only: '1.6' }, ({ module, test, createStore }) => {

  let store;
  let db;

  let TestModel = Model.extend({
    value: attr('float'),
    value0: attr('float', { round: 0 }),
    value2: attr('float', { round: 2 }),
    value3: attr('float', { round: 3 }),
  });

  module('attribute-transform-float', () => {
    registerModels({ TestModel });
    store = createStore();
    db = store.get('db.main');
    return cleanup(store, [ 'main' ]);
  });

  test('transform', (assert) => {
    let model = db.model('test-model', { value: 1.99999, value0 : '1.9999', value2: '1.009', value3: 1.00059 });
    assert.ok(model.get('value') === 1.99999);
    assert.ok(model.get('value0') === 1.9999);
    assert.ok(model.get('value2') === 1.01);
    assert.ok(model.get('value3') === 1.001);
  });

  test('save and load', (assert) => {
      let model = db.model('test-model', { id: 'model', value : 1.99999, value0: 1.99999, value2: 1.0059, value3: 1.00059 });
      return model.save().then(() => {
        return db.load('test-model', 'model', { force: true });
      }).then((model) => {
        assert.ok(model.get('value') === 1.99999);
        assert.ok(model.get('value0') === 1.99999);
        assert.ok(model.get('value2') === 1.01);
        assert.ok(model.get('value3') === 1.001);
      });
  });

});

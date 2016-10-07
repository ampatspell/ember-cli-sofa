import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, attr } from 'sofa';

let store;
let db;

let TestModel = Model.extend({
  value: attr('json'),
});

module('attribute-transform-json', () => {
  registerModels({ TestModel });
  store = createStore();
  db = store.get('db.main');
  return cleanup(store, [ 'main' ]);
});

test('transform', (assert) => {
  var value = { ok: true };
  value.arg = value;

  let model = db.model('test-model', { value : value });
  assert.ok(model.get('value') === null);

  model.set('value', value);
  assert.ok(model.get('value') === null);

  model.set('value', { ok: true });
  assert.deepEqual({ ok: true }, model.get('value'));

  return db.get('documents').save({ _id: 'model', value: { ok: true }, type: 'test-model' }).then(() => {
    return db.load('test-model', 'model');
  }).then(model => {
    assert.deepEqual({ ok: true }, model.get('value'));
  });
});

test('save and load', assert => {
  var value = { ok: true };
  let model = db.model('test-model', { id: 'model', value : value });
  return model.save().then(() => {
    return db.load('test-model', 'model', { force: true });
  }).then(model => {
    assert.deepEqual({ ok: true }, model.get('value'));
  });
});

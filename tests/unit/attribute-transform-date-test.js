import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, attr } from 'sofa';

let store;
let db;

let TestModel = Model.extend({
  value: attr('date'),
});

module('attribute-transform-date', () => {
  registerModels({ TestModel });
  store = createStore();
  db = store.get('db.main');
  return cleanup(store, [ 'main' ]);
});

test('transform', assert => {
  var value = new Date();

  let model = db.model('test-model', { value : value });
  assert.ok(model.get('value') === value);

  model.set('value', value);
  assert.ok(model.get('value') === value);

  return db.get('documents').save({ _id: 'model', value: value.toJSON(), type: 'test-model' }).then(() => {
    return db.load('test-model', 'model');
  }).then(model => {
    assert.ok(value.toJSON() === model.get('value').toJSON());
  });
});

test('save and load', assert => {
  var value = new Date();
  let model = db.model('test-model', { id: 'model', value : value });
  return model.save().then(() => {
    return db.load('test-model', 'model', { force: true });
  }).then(model => {
    assert.ok(model.get('value').toJSON() === value.toJSON());
  });
});

test('save and load null', assert => {
  let model = db.model('test-model', { id: 'model', value : null });
  return model.save().then(() => {
    return db.load('test-model', 'model', { force: true });
  }).then(model => {
    assert.ok(model.get('value') === null);
  });
});

test('load broken', assert => {
  return db.get('documents').save({ _id: 'model', value: 'broken', type: 'test-model' }).then(() => {
    return db.load('test-model', 'model');
  }).then(model => {
    assert.ok(model.get('value') === null);
  });
});

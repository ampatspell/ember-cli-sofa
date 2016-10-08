import { module, test, createStore, registerModels } from '../helpers/setup';
import { Model } from 'sofa';

let store;
let db;

let Duck = Model.extend({
});

module('model-new', () => {
  registerModels({ Duck });
  store = createStore();
  db = store.get('db.main');
});

test('new model is added to all and new identity arrays', assert => {
  let model = db.model('duck');
  assert.ok(db._modelIdentity.new[0] === model._internal);
  assert.ok(db._modelIdentity.all[0] === model._internal);
});

test('saved model is removed from new', assert => {
  let model = db.model('duck');
  return model.save().then(() => {
    assert.ok(db._modelIdentity.new.length === 0);
    assert.ok(db._modelIdentity.all[0] === model._internal);
  });
});

test('store created model is added to identity on database assign', assert => {
  let model = store.model('duck');
  model.set('database', db);
  assert.ok(db._modelIdentity.new[0] === model._internal);
  assert.ok(db._modelIdentity.all[0] === model._internal);

  let second = store.database('second');
  model.set('database', second);

  assert.ok(db._modelIdentity.new.length === 0);
  assert.ok(db._modelIdentity.all.length === 0);

  assert.ok(second._modelIdentity.new[0] === model._internal);
  assert.ok(second._modelIdentity.all[0] === model._internal);
});

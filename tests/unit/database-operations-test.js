import { configurations, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix } from 'sofa';

configurations(({ module, test, createStore }) => {

  let store;
  let db;

  let Duck = Model.extend({
    id: prefix()
  });

  function flush() {
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'duck' ]);
  }

  module('database-operations', () => {
    registerModels({ Duck });
    flush();
    return cleanup(store, [ 'main' ]);
  });

  test('database has operations', assert => {
    let ops = db.get('operations');
    assert.ok(ops);
  });

  test('database operation is registered for model save', assert => {
    let model = db.model('duck', { id: 'yellow' });
    let ops = db.get('operations');

    let promise = model.save();
    assert.ok(ops.get('internalOperations.length') === 1);

    let op = ops.get('internalOperations.lastObject');
    assert.equal(op.owner, ops);
    assert.equal(op.isDone, false);
    assert.equal(op.subject, model._internal);
    assert.equal(op.name, 'internal-model-save');
    assert.ok(op.promise);

    return promise.then(() => {
      assert.ok(ops.get('internalOperations.length') === 0);
      assert.ok(op.isDone);
    });
  });

  test('wait for all ops to finish', assert => {
    let ops = db.get('operations');
    db.model('duck', { id: 'yellow' }).save();
    assert.ok(ops.get('internalOperations.length') === 1);
    ops.wait().then(() => {
      assert.ok(ops.get('internalOperations.length') === 0);
    });
  });

});

import { configurations, registerModels, cleanup } from '../helpers/setup';
import { Model, attr } from 'sofa';

configurations(({ module, test, createStore }) => {

  let store;
  let db;

  let TestDuck = Model.extend({
    name: attr()
  });

  let TestYellowDuck = TestDuck.extend({
  });

  let TestSmartYellowDuck = TestYellowDuck.extend({
  });

  let flush = () => {
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'test-duck', 'test-yellow-duck', 'test-smart-yellow-duck' ]);
  };

  module('model-inheritance', () => {
    registerModels({ TestDuck, TestYellowDuck, TestSmartYellowDuck });
    flush();
    return cleanup(store, [ 'main' ]);
  });

  test('load yellow duck', assert => {
    let model = db.model('test-yellow-duck', { id: 'hello', name: 'yellow' });
    return model.save().then(() => {
      return db.get('documents').load('hello');
    }).then(doc => {
      assert.deepEqual_({
        "_id": "hello",
        "_rev": "ignored",
        "type": "test-yellow-duck",
        "name": "yellow"
      }, doc);
      flush();
      return db.load('test-yellow-duck', 'hello');
    }).then(model => {
      assert.equal(model.get('modelName'), 'test-yellow-duck');
      assert.equal(model.get('name'), 'yellow');
    });
  });

  test('load yellow duck as a duck', assert => {
    let model = db.model('test-yellow-duck', { id: 'hello', name: 'yellow' });
    return model.save().then(() => {
      flush();
      return db.load('test-duck', 'hello');
    }).then(model => {
      assert.equal(model.get('modelName'), 'test-yellow-duck');
      assert.equal(model.get('name'), 'yellow');
    });
  });

  test('load duck as yellow-duck fails', assert => {
    let model = db.model('test-duck', { id: 'hello', name: 'plain' });
    return model.save().then(() => {
      flush();
      return db.load('test-yellow-duck', 'hello');
    }).then(() => {
      assert.ok(false, 'should reject');
    }, err => {
      assert.deepEqual({
        "error": "invalid_document",
        "reason": "document 'hello' is expected to be 'test-yellow-duck' not 'test-duck'"
      }, err.toJSON());
    });
  });

  test('is instance of', function(assert) {
    function t(ok, a, b) {
      let aa = db.modelClassForName(a);
      let bb = db.modelClassForName(b);
      assert.ok(db._definitionForModelClass(aa).is(bb) === ok, `${ok} ${aa.class} -> ${bb.class}`);
    }

    t(true, 'test-duck', 'test-duck');
    t(true, 'test-yellow-duck', 'test-yellow-duck');
    t(true, 'test-smart-yellow-duck', 'test-smart-yellow-duck');

    t(true, 'test-yellow-duck', 'test-duck');
    t(true, 'test-smart-yellow-duck', 'test-duck');

    t(true, 'test-smart-yellow-duck', 'test-yellow-duck');

    t(false, 'test-duck', 'test-yellow-duck');
    t(false, 'test-duck', 'test-smart-yellow-duck');
    t(false, 'test-yellow-duck', 'test-smart-yellow-duck');
  });

});

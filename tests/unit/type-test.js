import Ember from 'ember';
import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, type } from 'sofa';

const {
  RSVP: { resolve, hash }
} = Ember;

let store;
let db;

let TestDuck = Model.extend({
});

let CustomDuck = Model.extend({
  type: type({ key: 'kind', value: 'custom_duck', foof: true }),
});

let flush = () => {
  store = createStore();
  db = store.get('db.main');
  db.set('modelNames', [ 'test-duck', 'custom-duck' ]);
};

module('type', () => {
  registerModels({ TestDuck, CustomDuck });
  flush();
  return cleanup(store, [ 'main' ]);
});

test('default initial type is set', assert => {
  var model = db.model('test-duck');
  assert.equal(model.get('type'), 'test-duck');
});

test('initial value cannot be overridden', assert => {
  return resolve().then(() => {
    return db.model('test-duck', { type: 'foof' });
  }).then(() => {
    assert.ok(false);
  }, err => {
    assert.deepEqual(err.toJSON(), {
      "error": "assertion",
      "reason": "Type value must be 'test-duck'"
    });
  });
});

test('initial value cannot be changed', assert => {
  let model = db.model('test-duck');
  return resolve().then(() => {
    model.set('type', 'foof');
  }).then(() => {
    assert.ok(false);
  }, err => {
    assert.equal(model.get('type'), 'test-duck');
    assert.deepEqual(err.toJSON(), {
      "error": "assertion",
      "reason": "Type value must be 'test-duck'"
    });
  });
});

test('custom key and value', assert => {
  var model = db.model('custom-duck');
  assert.deepEqual(model.serialize(), {
    kind: 'custom_duck',
    _attachments: {},
  });
});

test('matchedDocument', assert => {
  var model = db.model('test-duck', {});
  var type = model.get('_internal').getProperty('type');
  var modelClass = model.constructor;

  assert.ok(!type.matchesDocument(modelClass));
  assert.ok(!type.matchesDocument(modelClass, {}));

  assert.ok(!type.matchesDocument(modelClass, { type: 'test_duck' }));
  assert.ok(!type.matchesDocument(modelClass, { kind: 'test-duck' }));

  assert.ok(type.matchesDocument(modelClass, { type: 'test-duck' }));
});

test('matchesDocument for custom key-value', assert => {
  var model = db.model('custom-duck', {});
  var type = model.get('_internal').getProperty('type');
  var modelClass = model.constructor;

  assert.ok(!type.matchesDocument(modelClass));
  assert.ok(!type.matchesDocument(modelClass, {}));

  assert.ok(!type.matchesDocument(modelClass, { type: 'custom_duck' }));
  assert.ok(!type.matchesDocument(modelClass, { kind: 'custom-duck' }));

  assert.ok(type.matchesDocument(modelClass, { kind: 'custom_duck' }));
});

test('load model', assert => {
  return db.model('custom-duck', { id: 'duck' }).save().then(() => {
    flush();
    return hash({
      doc: db.get('documents').load('duck'),
      model: db.load('custom-duck', 'duck')
    });
  }).then(hash => {
    assert.deepEqual_({
      "_id": "duck",
      "_rev": "ignored",
      "kind": "custom_duck"
    }, hash.doc);
    assert.ok(hash.model.get('modelName') === 'custom-duck');
  });
});

test('deserialize document without knowing the type', assert => {
  return db.model('custom-duck', { id: 'duck' }).save().then(() => {
    flush();
    db.set('modelNames', [ 'custom-duck' ]);
    return db.get('documents').load('duck');
  }).then(doc => {
    let model = db.push(doc);
    assert.ok(model);
    assert.ok(model.get('modelName') === 'custom-duck');
  });
});

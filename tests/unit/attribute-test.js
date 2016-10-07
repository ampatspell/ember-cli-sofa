import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, attr } from 'sofa';

let store;
let db;

let TestDuck = Model.extend({
  name: attr(),
  email: attr({ serialize: false, deserialize: false }),
});

let TestHouse = Model.extend({
  name: attr('string', { initial: 'untitled' }),
  location: attr('string', { initial: function() { return 'unknown'; } }),
});

module('attribute', () => {
  registerModels({ TestDuck, TestHouse });
  store = createStore();
  db = store.get('db.main');
  return cleanup(store, [ 'main' ]);
});

test('atribute initial value is set', assert => {
  let model = db.model('test-duck', { name: 'hello' });
  assert.equal(model.get('_internal').values.name, 'hello');
  assert.equal(model.get('name'), 'hello');
});

test('attribute can be set', assert => {
  let model = db.model('test-duck', { name: 'hello' });
  model.set('name', 'other');
  assert.equal(model.get('_internal').values.name, 'other');
  assert.equal(model.get('name'), 'other');
});

test.skip('initial value is set if opts is undefined', assert => {
  let model = db.model('test-house');
  assert.equal(model.get('_internal').values.name, 'untitled');
  assert.equal(model.get('name'), 'untitled');
});

test.skip('initial value fn is set if opts is undefined', assert => {
  let model = db.model('test-house');
  assert.equal(model.get('_internal').values.location, 'unknown');
  assert.equal(model.get('location'), 'unknown');
});

test('do not serialize serialize:false attr', assert => {
  let model = db.model('test-duck', { name: 'yellow', email: 'yello@ducks.com' });
  assert.deepEqual({
    "name": "yellow",
    "type": "test-duck",
    // "_attachments": {},
  }, model.serialize());
});

test('do not deserialize deserialize:false attr', assert => {
  return db.get('documents').save({ _id: 'yellow', type: 'test-duck', email: 'yellow@ducks.com' }).then(() => {
    return db.load('test-duck', 'yellow');
  }).then(model => {
    assert.ok(model.get('email') === undefined);
  });
});

import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, attr } from 'sofa';
import assert_ from 'sofa/util/assert';

let store;
let db;

module('model-callbacks', () => {
  store = createStore();
  db = store.get('db.main');
  return cleanup(store, [ 'main' ]);
});

test('lifecycle callbacks are called', (assert) => {
  let called = [];

  let Duck = Model.extend({

    name: attr('string'),

    willCreate() {
      called.push(`willCreate ${this.get('id')}`);
      assert_({
        error: 'forbidden',
        reason: `id must be 'yellow'`
      }, this.get('id') === 'yellow');
    },

    willSave() {
      called.push(`willSave ${this.get('id')}`);
    },

    willDelete() {
      called.push(`willDelete ${this.get('id')}`);
    }

  });

  registerModels({ Duck });

  let model = db.model('duck');

  return model.save().then(() => {
    assert.ok(false, 'should reject');
  }, err => {
    assert.deepEqual({
      "error": "forbidden",
      "reason": "id must be 'yellow'"
    }, err.toJSON());

    assert.ok(model.get('error') === err);

    assert.deepEqual([
      "willCreate undefined"
    ], called);

    called.length = 0;

    model.set('id', 'yellow');
    return model.save();
  }).then(() => {
    assert.deepEqual([
      "willCreate yellow",
      "willSave yellow"
    ], called);

    called.length = 0;

    model.set('name', 'other');

    return model.save();
  }).then(() => {
    assert.deepEqual([
      "willSave yellow"
    ], called);

    called.length = 0;

    return model.delete();
  }).then(() => {
    assert.deepEqual([
      "willDelete yellow"
    ], called);

    called.length = 0;

    return model.save();
  }).then(() => {
    assert.deepEqual([
      "willSave yellow"
    ], called);
  });
});

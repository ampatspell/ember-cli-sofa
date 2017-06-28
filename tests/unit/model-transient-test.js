import Ember from 'ember';
import { configurations, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, attr } from 'sofa';

const {
  RSVP: { resolve }
} = Ember;

configurations(({ module, test, createStore }) => {

  let store;
  let db;

  let Duck = Model.extend({

    id: prefix(),
    name: attr('string'),

  });

  module('model-transient', () => {
    registerModels({ Duck });
    store = createStore();
    db = store.get('db.main');
    return cleanup(store, [ 'main' ]);
  });

  test('create', assert => {
    let duck = db.transient('duck', 'yellow');
    assert.deepEqual(duck.get('state'), {
      "error": null,
      "isDeleted": false,
      "isDirty": false,
      "isError": false,
      "isLoaded": true,
      "isLoading": false,
      "isNew": false,
      "isSaving": false
    });
    assert.ok(duck.get('_internal').transient);
    assert.ok(db.existing('duck', 'yellow') === duck);
  });

  test('create transient throws if there is non-transient', assert => {
    db.existing('duck', 'yellow', { create: true });
    return resolve().then(() => {
      db.transient('duck', 'yellow');
    }).then(() => {
      assert.ok(false, 'should reject');
    }, err => {
      assert.deepEqual(err.toJSON(), {
        "error": "transient",
        "reason": "model 'duck' with id 'yellow' is already loaded"
      });
    });
  });

  test('transient models are singletons', assert => {
    assert.ok(db.transient('duck', 'yellow') === db.transient('duck', 'yellow'));
    assert.ok(db.transient('duck', 'red') !== db.transient('duck', 'yellow'));
  });

  test('cannot save transient model', assert => {
    return resolve().then(() => {
      return db.transient('duck', 'yellow').save();
    }).then(() => {
      assert.ok(false, 'should reject');
    }, err => {
      assert.deepEqual(err.toJSON(), {
        "error": "transient",
        "reason": "cannot save transient model"
      });
    });
  });

  test('cannot reload transient model', assert => {
    return resolve().then(() => {
      return db.transient('duck', 'yellow').reload();
    }).then(() => {
      assert.ok(false, 'should reject');
    }, err => {
      assert.deepEqual(err.toJSON(), {
        "error": "transient",
        "reason": "cannot reload transient model"
      });
    });
  });

  test('cannot delete transient model', assert => {
    return resolve().then(() => {
      return db.transient('duck', 'yellow').delete();
    }).then(() => {
      assert.ok(false, 'should reject');
    }, err => {
      assert.deepEqual(err.toJSON(), {
        "error": "transient",
        "reason": "cannot delete transient model"
      });
    });
  });

});

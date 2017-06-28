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
    db.set('modelNames', [ 'duck' ]);
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

  test('deserialize transient throws', assert => {
    db.transient('duck', 'yellow');
    return resolve().then(() => {
      db.push({
        _id: 'duck:yellow',
        type: 'duck'
      });
    }).then(() => {
      assert.ok(false, 'should reject');
    }, err => {
      assert.deepEqual(err.toJSON(), {
        "error": "transient",
        "reason": "cannot deserialize document 'duck:yellow' for transient model 'duck'"
      });
    });
  });

  test('deserialize delete for transient throws', assert => {
    db.transient('duck', 'yellow');
    return resolve().then(() => {
      db.push({
        _deleted: true,
        _id: 'duck:yellow',
        type: 'duck'
      });
    }).then(() => {
      assert.ok(false, 'should reject');
    }, err => {
      assert.deepEqual(err.toJSON(), {
        "error": "transient",
        "reason": "cannot deserialize document 'duck:yellow' delete for transient model 'duck'"
      });
    });
  });

  test('transient models are included in shoebox', assert => {
    db.transient('duck', 'yellow');
    assert.deepEqual_(db._createShoebox(), {
      "documents": [
        {
          "_transient": true,
          "_id": "duck:yellow",
          "name": null,
          "type": "duck"
        }
      ]
    });
  });

  test('transient models are pushed from shoebox', assert => {
    let info = db._pushShoeboxDocument({
      "_transient": true,
      "_id": "duck:yellow",
      "name": null,
      "type": "duck"
    });
    assert.ok(info.get());
    assert.ok(db.transient('duck', 'yellow'));
    assert.ok(info.get() === db.transient('duck', 'yellow'));
  });

});

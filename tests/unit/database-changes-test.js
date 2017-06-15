import { registerModels, registerChanges, next, cleanup, configurations, wait } from '../helpers/setup';
import { Model, Changes, prefix, attr } from 'sofa';

configurations(({ module, test, createStore, config }) => {

  let store;
  let db;

  let Duck = Model.extend({
    id: prefix('the-duck:'),
    name: attr('string'),
  });

  let All = Changes.extend({

    feed: config.feed,
    view: null,

  });

  module('database-changes', () => {
    registerModels({ Duck });
    registerChanges({ All });
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'duck' ]);
    return cleanup(store, [ 'main' ]);
  });

  test('changes model is created', assert => {
    let changes = db.changes('all');
    assert.ok(changes);
  });

  test('changes model is cached', assert => {
    assert.ok(db.changes('all') === db.changes('all'));
  });

  test('changes model has cache identifier', assert => {
    assert.ok(db.changes('all', { ok: true }) === db.changes('all', { ok: true }));
    let changes = db.changes('all', { ok: true });
    assert.ok(changes.get('ok'));
    assert.equal(changes.get('_internal').identifier, 'all {\"ok\":true}');
  });

  test('destroy changes model destroys internal', assert => {
    let changes = db.changes('all');
    assert.ok(db._changesIdentity['all null']);
    changes.destroy();
    return next().then(() => {
      assert.ok(!db._changesIdentity['all null']);
    });
  });

  test('start listening', assert => {
    let changes = db.changes('all');
    let log = [];
    changes.on('change', model => {
      log.push(model);
    });
    changes.start();
    return wait(null, 100).then(() => {
      return db.get('documents').save({ _id: 'the-duck:yellow', type: 'duck' }).then(json => wait(json, 1000));
    }).then(json => {
      assert.ok(db.existing('duck', 'yellow'));
      return db.get('documents').delete('the-duck:yellow', json.rev).then(() => wait(null, 1000));
    }).then(() => {
      assert.ok(!db.existing('duck', 'yellow'));
      assert.ok(db.existing('duck', 'yellow', { deleted: true }));
      assert.deepEqual(log.map(item => item.toJSON()), [
        {
          "deleted": false,
          "id": "yellow",
          "model": "duck"
        },
        {
          "deleted": true,
          "id": "yellow",
          "model": "duck"
        }
      ]);
    });
  });

});

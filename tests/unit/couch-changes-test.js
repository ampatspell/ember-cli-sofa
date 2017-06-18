import { configurations, cleanup, registerChanges, next, wait } from '../helpers/setup';
import { CouchChanges } from 'sofa';

configurations(({ module, test, createStore, config }) => {

  let store;
  let couch;

  let All = CouchChanges.extend({
    feed: config.feed
  });

  function flush() {
    store = createStore();
    couch = store.get('db.main.couch');
  }

  module('couch-changes', () => {
    registerChanges({ All });
    flush();
    return cleanup(store, [ 'main', 'second' ]);
  });

  test('changes is created', assert => {
    let changes = couch.changes('all', { ok: true });
    assert.ok(changes);
    assert.equal(changes._internal.identifier, 'all {\"ok\":true}');
    assert.ok(couch.changes('all') === couch.changes('all'));
    assert.ok(couch.changes('all', { ok: true }) === couch.changes('all', { ok: true }));
    assert.ok(couch.changes('all', { ok: true }) !== couch.changes('all'));
  });

  test('changes destroy', assert => {
    let changes = couch.changes('all');
    assert.ok(couch._changesIdentity['all null']);
    changes.destroy();
    return next().then(() => {
      assert.ok(!couch._changesIdentity['all null']);
    });
  });

  test('destroy couch destroys changes', assert => {
    let changes = couch.changes('all');
    assert.ok(couch._changesIdentity['all null']);
    couch.destroy();
    return next().then(() => {
      assert.ok(!couch._changesIdentity['all null']);
      assert.ok(changes.isDestroyed);
    });
  });

  test('changes listen', assert => {
    let log = [];
    let changes = couch.changes('all');
    changes.on('change', data => {
      if(data.name === '_dbs') {
        return;
      }
      log.push(data);
    });
    changes.on('error', err => {
      log.push(err.toJSON ? err.toJSON() : err);
    });
    changes.start();
    return wait(null, 300).then(() => {
      let db = store.get('db.second.documents.database');
      return db.delete().then(() => {
        return db.create();
      });
    }).then(() => {
      return wait(null, 300);
    }).then(() => {
      if(config.name === '2.0') {
        assert.ok(log.find(json => {
          return json.name === 'ember-cli-sofa-test-second' && json.type === 'deleted';
        }));
        assert.ok(log.find(json => {
          return json.name === 'ember-cli-sofa-test-second' && json.type === 'created';
        }));
      } else {
        assert.deepEqual(log, [
          {
            "name": "ember-cli-sofa-test-second",
            "type": "deleted"
          },
          {
            "name": "ember-cli-sofa-test-second",
            "type": "created"
          }
        ]);
      }
    });
  });

});

import Ember from 'ember';
import { module, test, createStore, cleanup, login, logout } from '../helpers/setup';
import { later } from 'sofa/util/run';

const {
  RSVP: { resolve }
} = Ember;

let store;
let db;
let database;

module('couch-database-database', () => {
  store = createStore();
  db = store.get('db.main');
  database = db.get('documents.database');
  return cleanup(store, [ 'main' ]);
});

test('exists', assert => {
  assert.ok(database);
});

test('get database info', function(assert) {
  return database.info().then(resp => {
    assert.ok(resp);
    assert.equal(resp.db_name, db.get('documents.name'));
  });
});

test('delete and create database', function(assert) {
  return login(db).then(() => {
    return database.create({ optional: true });
  }).then(data => {
    assert.deepEqual({
      existed: true,
      ok: true
    }, data);
    return database.delete();
  }).then(data => {
    assert.deepEqual({ ok: true }, data);
    return later(300).then(() => database.create());
  }).then(data => {
    assert.deepEqual({ ok: true }, data);
    return database.info();
  }).then(data => {
    assert.equal(data.db_name, db.get('documents.name'));
  });
});

test('create non-optional database', function(assert) {
  return logout(db).then(() => {
    return database.create();
  }).then(() => {
    assert.ok(false, 'should reject');
  }, err => {
    assert.deepEqual_({
      "error": "unauthorized",
      "reason": "You are not a server admin.",
      "status": 401
    }, err.toJSON());
  });
});

test('delete non-optional database', function(assert) {
  return logout(db).then(() => {
    return database.delete();
  }).then(() => {
    assert.ok(false, 'should reject');
  }, err => {
    assert.deepEqual_({
      "error": "unauthorized",
      "reason": "You are not a server admin.",
      "status": 401
    }, err.toJSON());
  });
});

test('delete optional database', function(assert) {
  return database.delete({ optional: true }).then(data => {
    assert.deepEqual({ ok: true }, data);
    return database.delete({ optional: true });
  }).then(data => {
    assert.deepEqual({ ok: true, existed: false }, data);
  });
});

test('recreate database type:documents', function(assert) {
  return db.get('documents').save({_id: 'hello'}).then(() => {
    return database.recreate({ type: 'documents' });
  }).then(data => {
    assert.deepEqual_({ ok: true }, data);
    return db.get('documents').all();
  }).then(data => {
    assert.deepEqual_({
      "offset": 0,
      "total_rows": 0,
      "rows": []
    }, data);
  });
});

test('recreate database type:database', function(assert) {
  return db.get('documents').save({_id: 'hello'}).then(() => {
    return database.recreate({ type: 'database' });
  }).then(data => {
    assert.deepEqual_({ ok: true }, data);
    return db.get('documents').all();
  }).then(data => {
    assert.deepEqual_({
      "offset": 0,
      "total_rows": 0,
      "rows": []
    }, data);
  });
});

test('recreate with invalid type', function(assert) {
  return resolve().then(() => {
    return database.recreate({ type: 'bogus '});
  }).then(() => {
    assert.ok(false, 'should reject');
  }, err => {
    assert.equal(err.message, 'Assertion Failed: opts.type must be either documents or database');
  });
});

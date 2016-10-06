import { module, test, createStore, admin, logout } from '../helpers/setup';

let store;
let session;

module('couch-session', () => {
  store = createStore();
  session = store.get('db.main.documents.couch.session');
  return logout(store.get('db.main'));
});

test('session documents exists', function(assert) {
  assert.ok(session);
});

test('load anonymous', function(assert) {
  return session.load().then(data => {
    assert.equal(data.ok, true);
    assert.equal(data.userCtx.name, null);
    assert.deepEqual(data.userCtx.roles, []);
  });
});

test('save succeeds', function(assert) {
  return session.save(admin.name, admin.password).then(data => {
    assert.equal(data.ok, true);
    assert.equal(data.name, admin.name); // 2.0
    return session.load();
  }).then(data => {
    assert.equal(data.userCtx.name, admin.name);
  });
});

test('save fails', function(assert) {
  return session.save('foof', '123').then(() => {
    assert.ok(false, 'should reject');
  }, err => {
    assert.deepEqual({
      "status": 401,
      "error": "unauthorized",
      "reason": "Name or password is incorrect."
    }, err.toJSON());
  });
});

test('delete succeeds', function(assert) {
  return session.save(admin.name, admin.password).then(() => {
    return session.delete();
  }).then(data => {
    assert.deepEqual({ ok: true }, data);
    return session.load();
  }).then(data => {
    assert.equal(data.ok, true);
    assert.equal(data.userCtx.name, null);
    assert.deepEqual(data.userCtx.roles, []);
  });
});

function testTrigger(name, fn) {
  test(name, (assert) => {
    let docs = session;

    let log = [];

    docs.on('login', function() {
      log.push('login');
    });

    docs.on('logout', function() {
      log.push('logout');
    });

    return fn(assert, docs, log);
  });
}

testTrigger('login triggers', (assert, docs, log) => {
  return docs.save(admin.name, admin.password).then(() => {
    assert.deepEqual(log, ['login']);
  });
});

testTrigger('login fails triggers logout', (assert, docs, log) => {
  return docs.save(admin.name, 'bogus').then(() => {
    assert.ok(false, 'should reject');
  }, () => {
    assert.deepEqual(log, ['logout']);
  });
});

testTrigger('logout triggers', (assert, docs, log) => {
  return docs.delete().then(() => {
    assert.deepEqual(log, ['logout']);
  });
});

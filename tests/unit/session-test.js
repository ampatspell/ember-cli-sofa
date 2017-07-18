import { configurations, login, logout, admin, next } from '../helpers/setup';

configurations(({ module, test, createStore }) => {

  let store;
  let db;
  let session;

  module('session', () => {
    store = createStore();
    db = store.get('db.main');
    session = db.get('couch.session');
    return logout(db);
  });

  test('exists', assert => {
    assert.ok(session);
  });

  test('session exists, initial state', assert => {
    assert.deepEqual({
      "error": null,
      "isDirty": false,
      "isError": false,
      "isLoaded": false,
      "isLoading": false,
      "isSaving": false
    }, session.get('state'));

    assert.deepEqual(session.get('roles'), []);
    assert.ok(session.get('name') === null);
    assert.ok(session.get('password') === null);
    assert.ok(session.get('isAuthenticated') === false);
  });

  test('session name and password marks dirty', (assert) => {
    assert.ok(session.get('isDirty') === false);

    session.set('name', admin.name);
    session.set('password', admin.password);

    assert.ok(session.get('isDirty') === true);
    assert.ok(session.get('isAuthenticated') === false);
  });

  test('session save succeeds', assert => {
    session.set('name', admin.name);
    session.set('password', admin.password);
    return session.save().then(ret => {
      assert.ok(ret === session);
      assert.deepEqual({
        "error": null,
        "isDirty": false,
        "isError": false,
        "isLoaded": true,
        "isLoading": false,
        "isSaving": false
      }, session.get('state'));
      assert.ok(session.get('roles').indexOf('_admin') !== -1);
      assert.ok(session.get('password') === null);
      assert.ok(session.get('isAuthenticated') === true);
    });
  });

  test('session delete succeeds', assert => {
    session.set('name', admin.name);
    session.set('password', admin.password);

    return session.save().then(() => {
      return session.delete();
    }).then(resp => {
      assert.ok(resp === session);

      assert.deepEqual({
        "error": null,
        "isDirty": false,
        "isError": false,
        "isLoaded": false,
        "isLoading": false,
        "isSaving": false
      }, session.get('state'));

      assert.deepEqual(session.get('roles'), []);
      assert.ok(session.get('name') === null);
      assert.ok(session.get('password') === null);
      assert.ok(session.get('isAuthenticated') === false);
    });
  });

  test('load anon', assert => {
    return session.load().then((resp) => {
      assert.ok(resp === session);
      assert.deepEqual({
        "error": null,
        "isDirty": false,
        "isError": false,
        "isLoaded": true,
        "isLoading": false,
        "isSaving": false
      }, session.get('state'));
      assert.deepEqual(session.get('roles'), []);
      assert.ok(session.get('name') === null);
      assert.ok(session.get('password') === null);
      assert.ok(session.get('isAuthenticated') === false);
    });
  });

  test('load logged in', assert => {
    return login(db).then(() => {
      return session.load();
    }).then(session => {
      assert.deepEqual({
        "error": null,
        "isDirty": false,
        "isError": false,
        "isLoaded": true,
        "isLoading": false,
        "isSaving": false
      }, session.get('state'));
      assert.ok(session.get('roles').indexOf('_admin') !== -1);
      assert.ok(session.get('name') === admin.name);
      assert.ok(session.get('password') === null);
      assert.ok(session.get('isAuthenticated') === true);
    });
  });

  test('login fails', assert => {
    session.set('name', 'bogus');
    session.set('password', 'nothere');

    return session.save().then(() => {
      assert.ok(false, 'should reject');
    }, err => {
      assert.deepEqual({
        "error": "unauthorized",
        "reason": "Name or password is incorrect.",
        "status": 401
      }, err.toJSON());

      assert.deepEqual({
        "error": err,
        "isDirty": false,
        "isError": true,
        "isLoaded": true,
        "isLoading": false,
        "isSaving": false
      }, session.get('state'));

      assert.deepEqual(session.get('roles'), [], 'is ' + session.get('roles'));
      assert.ok(session.get('name') === 'bogus');
      assert.ok(session.get('password') === null);
      assert.ok(session.get('isAuthenticated') === false);
    });
  });

  test('login then second login logs out', assert => {
    session.set('name', admin.name);
    session.set('password', admin.password);
    return session.save().then(() => {
      assert.ok(session.get('isAuthenticated') === true);
      session.set('name', 'broken');
      return session.save();
    }).then(() => {
      assert.ok(false, 'should reject');
    }, (err) => {
      assert.deepEqual({
        "error": "unauthorized",
        "reason": "Name or password is incorrect.",
        "status": 401
      }, err.toJSON());

      assert.deepEqual({
        "error": err,
        "isDirty": false,
        "isError": true,
        "isLoaded": true,
        "isLoading": false,
        "isSaving": false
      }, session.get('state'));

      assert.deepEqual(session.get('roles'), []);
      assert.ok(session.get('name') === 'broken');
      assert.ok(session.get('password') === null);
      assert.ok(session.get('isAuthenticated') === false);
    });
  });

  test('login and then load', assert => {
    session.set('name', admin.name);
    session.set('password', admin.password);
    return session.save().then(() => {
      assert.ok(session.get('isAuthenticated') === true);
      return session.load();
    }).then(session => {
      assert.deepEqual({
        "error": null,
        "isDirty": false,
        "isError": false,
        "isLoaded": true,
        "isLoading": false,
        "isSaving": false
      }, session.get('state'));
      assert.ok(session.get('roles').indexOf('_admin') !== -1);
      assert.ok(session.get('name') === admin.name);
      assert.ok(session.get('password') === null);
      assert.ok(session.get('isAuthenticated') === true);
    });
  });

  test('restore', assert => {
    return login(db).then(() => {
      let promise = session.restore();
      assert.ok(promise === session.restore());
      return session.restore();
    }).then(session => {
      assert.deepEqual({
        "error": null,
        "isDirty": false,
        "isError": false,
        "isLoaded": true,
        "isLoading": false,
        "isSaving": false
      }, session.get('state'));
      assert.ok(session.get('roles').indexOf('_admin') !== -1);
      assert.ok(session.get('name') === admin.name);
      assert.ok(session.get('password') === null);
      assert.ok(session.get('isAuthenticated') === true);
    });
  });

  test('roles', assert => {
    return login(db).then(() => {
      assert.deepEqual(session.get('roles'), []);
      return session.restore();
    }).then(session => {
      assert.ok(session.get('roles').indexOf('_admin') !== -1);
      return session.load();
    }).then(session => {
      assert.ok(session.get('roles').indexOf('_admin') !== -1);
    });
  });

  test('session has operation', assert => {
    session.set('name', admin.name);
    session.set('password', admin.password);
    assert.equal(session.get('couch.operations.internalOperations.length'), 0);
    let promise = session.save();
    assert.equal(session.get('couch.operations.internalOperations.length'), 1);
    return promise.then(() => next()).then(() => {
      assert.equal(session.get('couch.operations.internalOperations.length'), 0);
    });
  });

});

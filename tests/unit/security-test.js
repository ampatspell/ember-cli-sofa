import { module, test, createStore, login, logout } from '../helpers/setup';

let store;
let db;
let security;

module('security', () => {
  store = createStore();
  db = store.get('db.main');
  security = db.get('security');
  return logout(db);
});

test('exists', assert => {
  assert.ok(security);
});

test('load succeeds', assert => {
  assert.deepEqual({
    "error": null,
    "isDirty": false,
    "isError": false,
    "isLoaded": false,
    "isLoading": false,
    "isSaving": false
  }, security.get('state'));

  return security.load().then(res => {
    assert.deepEqual({
      "error": null,
      "isDirty": false,
      "isError": false,
      "isLoaded": true,
      "isLoading": false,
      "isSaving": false
    }, security.get('state'));
    assert.ok(res === security);
  });
});

test('save fails', assert => {
  return security.save().then(() => {
    assert.ok(false, 'should reject');
  }, (err) => {
    assert.deepEqual({
      "error": err,
      "isDirty": false,
      "isError": true,
      "isLoaded": false,
      "isLoading": false,
      "isSaving": false
    }, security.get('state'));

    if(err.reason === 'no_majority') {
      assert.deepEqual({
        "error": "error",
        "reason": "no_majority",
        "status": 500
      }, err.toJSON());
    } else {
      assert.deepEqual({
        "error": "unauthorized",
        "reason": "You are not a db or server admin.",
        "status": 401
      }, err.toJSON());
    }
  });
});

test('serialize empty', assert => {
  assert.deepEqual({
    "admins": {
      "names": [],
      "roles": []
    },
    "members": {
      "names": [],
      "roles": []
    }
  }, security.serialize());
});

test('serialize modified', assert => {
  security.get('admins.names').pushObject('ampatspell');
  security.get('members.roles').pushObject('guest');

  assert.deepEqual({
    "admins": {
      "names": ['ampatspell'],
      "roles": []
    },
    "members": {
      "names": [],
      "roles": ['guest']
    }
  }, security.serialize());
});

test('modify users and roles marks model dirty', assert => {
  assert.ok(security.get('isDirty') === false);
  security.get('admins.names').pushObject('admin');
  assert.ok(security.get('isDirty') === true);
});

test('save unsets isDirty', assert => {
  return login(db).then(() => {
    security.onDirty();
    return security.save();
  }).then(security => {
    assert.ok(security.get('isDirty') === false);
  });
});

test('save serializes, load deserializes', assert => {
  return login(db).then(() => {
    security.get('admins.roles').pushObject('random');

    assert.ok(security.get('isDirty') === true);
    assert.ok(security.get('isLoaded') === false);

    return security.save();
  }).then(security => {
    assert.ok(security.get('isDirty') === false);
    assert.ok(security.get('isLoaded') === true);

    return security.load();
  }).then(security => {

    assert.ok(security.get('isDirty') === false);
    assert.ok(security.get('isLoaded') === true);

    assert.deepEqual({
      "admins": {
        "names": [],
        "roles": [ "random" ]
      },
      "members": {
        "names": [],
        "roles": []
      }
    }, security.serialize());

    security.clear();

    assert.ok(security.get('isDirty') === true);
    assert.ok(security.get('isLoaded') === true);

    return security.save();
  });
});

test('data clear', assert => {
  security.get('members.names').pushObject('zeeba');
  security.get('admins.names').pushObject('admin');

  security.get('state').isDirty = false;
  security.notifyPropertyChange('isDirty');

  security.get('admins').clear();

  assert.ok(security.get('isDirty') === true);
  assert.deepEqual({
    "admins": {
      "names": [],
      "roles": []
    },
    "members": {
      "names": [
        "zeeba"
      ],
      "roles": []
    }
  }, security.serialize());
});

test('save fails', assert => {
  security.get('members.names').pushObject('zeeba');
  security.get('admins.names').pushObject('admin');
  return security.save().then(() => {
    assert.ok(false, 'should reject');
  }, (err) => {
    assert.deepEqual({
      "error": err,
      "isDirty": true,
      "isError": true,
      "isLoaded": false,
      "isLoading": false,
      "isSaving": false
    }, security.get('state'));

    if(err.reason === 'no_majority') {
      assert.deepEqual({
        "error": "error",
        "reason": "no_majority",
        "status": 500
      }, err.toJSON());
    } else {
      assert.deepEqual({
        "error": "unauthorized",
        "reason": "You are not a db or server admin.",
        "status": 401
      }, err.toJSON());
    }
  });
});

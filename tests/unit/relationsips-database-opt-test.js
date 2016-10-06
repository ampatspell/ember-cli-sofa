import Ember from 'ember';
import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, belongsTo } from 'sofa';

const {
  RSVP: { all }
} = Ember;

let store;
let main;
let second;

let Duck = Model.extend({
  id: prefix(),
  user: belongsTo('user', { inverse: 'duck', database: 'second' })
});

let User = Model.extend({
  id: prefix(),
  duck: belongsTo('duck', { inverse: 'user', database: 'main' })
});

function flush() {
  store = createStore();
  main = store.get('db.main');
  main.set('modelNames', [ 'duck', 'user' ]);
  second = store.get('db.second');
  second.set('modelNames', [ 'duck', 'user' ]);
}

module('relationships-database-opt-test', () => {
  registerModels({ Duck, User });
  flush();
  return cleanup(store, [ 'main', 'second' ]);
});

test('save duck and user', assert => {
  let duck = main.model('duck', { id: 'yellow' });
  let user = second.model('user', { id: 'yellow' });
  duck.set('user', user);
  return all([duck, user].map(model => model.save())).then(() => {
    return all([ main.get('documents').load('duck:yellow'), second.get('documents').load('user:yellow') ]);
  }).then(docs => {
    assert.deepEqual_(docs, [
      {
        "_id": "duck:yellow",
        "_rev": "ignored",
        "type": "duck",
        "user": "user:yellow"
      },
      {
        "_id": "user:yellow",
        "_rev": "ignored",
        "duck": "duck:yellow",
        "type": "user"
      }
    ]);
  });
});

test('load duck', assert => {
  let duck = main.model('duck', { id: 'yellow' });
  let user = second.model('user', { id: 'yellow' });
  duck.set('user', user);
  return all([duck, user].map(model => model.save())).then(() => {
    flush();
    return main.load('duck', 'yellow');
  }).then(duck => {
    return duck.get('user').load();
  }).then(user => {
    assert.ok(user.get('database') === second);
  });
});

test('load user', assert => {
  let duck = main.model('duck', { id: 'yellow' });
  let user = second.model('user', { id: 'yellow' });
  duck.set('user', user);
  return all([duck, user].map(model => model.save())).then(() => {
    flush();
    return second.load('user', 'yellow');
  }).then(user => {
    return user.get('duck').load();
  }).then(duck => {
    assert.ok(duck.get('database') === main);
  });
});

test('attempt to save model which is assigned to differnt database fails', assert => {
  let duck = main.model('duck', { id: 'yellow' });
  let user = main.model('user', { id: 'yellow' });
  duck.set('user', user);
  return duck.save().then(() => {
    assert.ok(false, 'should reject');
  }, err => {
    assert.deepEqual(err.toJSON(), {
      "error": "invalid_relationship",
      "reason": "duck 'duck:yellow' relationship 'user': user 'user:yellow' is expected to be saved in 'second' database, not in 'main'"
    });
  });
});

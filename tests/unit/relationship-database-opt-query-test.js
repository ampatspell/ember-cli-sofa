import Ember from 'ember';
import { module, test, createStore, registerModels, registerQueries, cleanup, wait } from '../helpers/setup';
import { Query, Model, prefix, belongsTo } from 'sofa';

const {
  RSVP: { all },
  computed
} = Ember;

let store;
let main;
let second;

let DuckUser = Query.extend({

  find: computed('model.docId', function() {
    return {
      selector: {
        duck: this.get('model.docId')
      }
    };
  }),

});

let Duck = Model.extend({
  id: prefix(),
  user: belongsTo('user', { inverse: 'duck', database: 'second', query: 'duck-user' })
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

module('relationships-database-opt-query', () => {
  registerModels({ Duck, User });
  registerQueries({ DuckUser });
  flush();
  return cleanup(store, [ 'main', 'second' ]);
});

test.skip('save duck and user (loaded proxy after save keeps isLoaded:false)', assert => {
  let duck = main.model('duck', { id: 'yellow' });
  let user = second.model('user', { id: 'yellow' });
  duck.set('user', user);
  assert.deepEqual(duck.get('user.state'), {
    "error": null,
    "isError": false,
    "isLoaded": false,
    "isLoading": false
  });
  return all([ duck, user ].map(model => model.save())).then(() => {
    assert.deepEqual(duck.get('user.state'), {
      "error": null,
      "isError": false,
      "isLoaded": true,
      "isLoading": false
    });
    assert.deepEqual(user.get('state'), {
      "error": null,
      "isDeleted": false,
      "isDirty": false,
      "isError": false,
      "isLoaded": true,
      "isLoading": false,
      "isNew": false,
      "isSaving": false
    });
  }).then(() => {
    return all([ main.get('documents').load('duck:yellow'), second.get('documents').load('user:yellow') ]);
  }).then(docs => {
    assert.deepEqual_(docs, [
      {
        "_id": "duck:yellow",
        "_rev": "ignored",
        "type": "duck"
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
    return wait(1000).then(() => main.load('duck', 'yellow')); // sleep for mango
  }).then(duck => {
    return duck.get('user.promise');
  }).then(user => {
    assert.ok(user.get('database') === second);
  });
});

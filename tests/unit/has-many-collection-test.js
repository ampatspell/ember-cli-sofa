/* global emit */
import Ember from 'ember';
import { configurations, registerModels, registerQueries, cleanup, next } from '../helpers/setup';
import { Query, Model, prefix, hasMany } from 'sofa';

const {
  computed,
  RSVP: { all }
} = Ember;

const ddoc = {
  views: {
    'all': {
      map(doc) {
        if(doc.type !== 'duck') {
          return;
        }
        emit(doc._id, null);
      }
    }
  }
};

configurations(({ module, test, createStore }) => {

  let store;
  let db;

  let AllDucks = Query.extend({
    find: computed(function() {
      return { ddoc: 'ducks', view: 'all' };
    })
  });

  let Duck = Model.extend({
    id: prefix(),
  });

  let Root = Model.extend({
    ducks: hasMany('duck', { inverse: null, query: 'all-ducks' })
  });

  function flush() {
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'root', 'duck' ]);
  }

  module('has-many-collection', () => {
    registerModels({ Duck, Root });
    registerQueries({ AllDucks });
    flush();
    return cleanup(store, [ 'main' ]).then(() => {
      return db.get('documents.design').save('ducks', ddoc);
    });
  });

  test('models are initially matched', assert => {
    [ 'yellow', 'red', 'green' ].map(id => db.model('duck', { id }));
    let root = db.model('root');
    assert.deepEqual(root.get('ducks').mapBy('id'), [ 'yellow', 'red', 'green' ]);
    return root.get('ducks.promise');
  });

  test('new models are added to collection', assert => {
    db.model('duck', { id: 'yellow' });
    let root = db.model('root');
    assert.deepEqual(root.get('ducks').mapBy('id'), [ 'yellow' ]);
    db.model('duck', { id: 'red' });
    assert.deepEqual(root.get('ducks').mapBy('id'), [ 'yellow', 'red' ]);
    db.model('duck', { id: 'green' });
    assert.deepEqual(root.get('ducks').mapBy('id'), [ 'yellow', 'red', 'green' ]);
    return root.get('ducks.promise');
  });

  test('destroyed isNew model is removed from coll', assert => {
    [ 'yellow', 'red', 'green' ].map(id => db.model('duck', { id }));
    let root = db.model('root');
    assert.deepEqual(root.get('ducks').mapBy('id'), [ 'yellow', 'red', 'green' ]);
    root.get('ducks').objectAt(0).destroy();
    return next().then(() => {
      assert.deepEqual(root.get('ducks').mapBy('id'), [ 'red', 'green' ]);
      return root.get('ducks.promise');
    });
  });

  test('assign database after model creation', assert => {
    db.model('duck', { id: 'yellow' });
    let root = store.model('root');
    assert.deepEqual(root.get('ducks').mapBy('id'), []);
    root.set('database', db);
    assert.deepEqual(root.get('ducks').mapBy('id'), [ 'yellow' ]);
  });

  test('load', assert => {
    let root;
    return all([ 'yellow', 'red', 'green' ].map(id => db.model('duck', { id }).save())).then(() => {
      flush();
      root = db.model('root');
      return root.get('ducks.promise');
    }).then(() => {
      assert.deepEqual(root.get('ducks').mapBy('id'), [ 'green', 'red', 'yellow' ]);
    });
  });

});

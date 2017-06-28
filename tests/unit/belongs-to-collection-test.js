/* global emit */
import Ember from 'ember';
import { configurations, registerModels, registerQueries, registerRelationships, cleanup, next, wait } from '../helpers/setup';
import { Relationship, Query, Model, prefix, belongsTo } from 'sofa';

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

  let AllDucksRelationship = Relationship.extend({
    query: 'all-ducks'
  });

  let Duck = Model.extend({
    id: prefix(),
  });

  let Root = Model.extend({
    ducks: belongsTo('duck', { inverse: null, relationship: 'all-ducks' })
  });

  function flush() {
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'root', 'duck' ]);
  }

  module('belongs-to-collection', () => {
    registerModels({ Duck, Root });
    registerQueries({ AllDucks });
    registerRelationships({ AllDucks: AllDucksRelationship });
    flush();
    return cleanup(store, [ 'main' ]).then(() => {
      return db.get('documents.design').save('ducks', ddoc);
    });
  });

  test.only('model is initially matched', assert => {
    [ 'yellow', 'red', 'green' ].map(id => db.model('duck', { id }));
    let root = db.model('root');
    assert.deepEqual(root.get('duck.id'), 'yellow');
    return root.get('duck.promise');
  });

  // test('new models are added to collection', assert => {
  //   db.model('duck', { id: 'yellow' });
  //   let root = db.model('root');
  //   assert.deepEqual(root.get('ducks').mapBy('id'), [ 'yellow' ]);
  //   db.model('duck', { id: 'red' });
  //   assert.deepEqual(root.get('ducks').mapBy('id'), [ 'yellow', 'red' ]);
  //   db.model('duck', { id: 'green' });
  //   assert.deepEqual(root.get('ducks').mapBy('id'), [ 'yellow', 'red', 'green' ]);
  //   return root.get('ducks.promise');
  // });

  // test('destroyed isNew model is removed from coll', assert => {
  //   [ 'yellow', 'red', 'green' ].map(id => db.model('duck', { id }));
  //   let root = db.model('root');
  //   assert.deepEqual(root.get('ducks').mapBy('id'), [ 'yellow', 'red', 'green' ]);
  //   root.get('ducks').objectAt(0).destroy();
  //   return next().then(() => {
  //     assert.deepEqual(root.get('ducks').mapBy('id'), [ 'red', 'green' ]);
  //     return root.get('ducks.promise');
  //   });
  // });

  // test('assign database after model creation', assert => {
  //   db.model('duck', { id: 'yellow' });
  //   let root = store.model('root');
  //   assert.deepEqual(root.get('ducks').mapBy('id'), []);
  //   root.set('database', db);
  //   assert.deepEqual(root.get('ducks').mapBy('id'), [ 'yellow' ]);
  // });

  // test('autoload', assert => {
  //   let root;
  //   return all([ 'yellow', 'red', 'green' ].map(id => db.model('duck', { id }).save())).then(() => {
  //     flush();
  //     root = db.model('root');
  //     assert.deepEqual(root.get('ducks').mapBy('id'), []);
  //     return wait(null, 300);
  //   }).then(() => {
  //     assert.deepEqual(root.get('ducks').mapBy('id'), [ 'green', 'red', 'yellow' ]);
  //   });
  // });

  // test('load', assert => {
  //   let root;
  //   return all([ 'yellow', 'red', 'green' ].map(id => db.model('duck', { id }).save())).then(() => {
  //     flush();
  //     root = db.model('root');
  //     return root.get('ducks.promise');
  //   }).then(() => {
  //     assert.deepEqual(root.get('ducks').mapBy('id'), [ 'green', 'red', 'yellow' ]);
  //   });
  // });

  // test('destroy', assert => {
  //   let root;
  //   let relation;
  //   return all([ 'yellow', 'red', 'green' ].map(id => db.model('duck', { id }).save())).then(() => {
  //     flush();
  //     root = db.model('root');
  //     return root.get('ducks.promise');
  //   }).then(() => {
  //     assert.deepEqual(root.get('ducks').mapBy('id'), [ 'green', 'red', 'yellow' ]);
  //     relation = root.get('ducks._relation');
  //     assert.ok(relation);
  //     root.get('ducks').destroy();
  //     return next();
  //   }).then(() => {
  //     assert.ok(!relation.value);
  //     assert.ok(!root.get('ducks').isDestroying);
  //     assert.ok(relation.value);
  //   });
  // });

});

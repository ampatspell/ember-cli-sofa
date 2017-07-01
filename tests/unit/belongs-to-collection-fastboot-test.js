/* global emit */
import Ember from 'ember';
import { configurations, registerModels, registerQueries, registerRelationships, cleanup } from '../helpers/setup';
import { Relationship, Query, Model, prefix, belongsTo } from 'sofa';

const {
  computed
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

configurations({ only: '1.6' }, ({ module, test, createStore }) => {

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
    duck: belongsTo('duck', { inverse: null, relationship: 'all-ducks' })
  });

  function flush() {
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'root', 'duck' ]);
  }

  module('belongs-to-collection-fastboot', () => {
    registerModels({ Duck, Root });
    registerQueries({ AllDucks });
    registerRelationships({ AllDucks: AllDucksRelationship });
    flush();
    return cleanup(store, [ 'main' ]).then(() => {
      return db.get('documents.design').save('ducks', ddoc);
    });
  });

  test('create shoebox with loaded relationship', assert => {
    return db.model('duck', { id: 'yellow' }).save().then(() => {
      let root = db.transient('root', 'singleton');
      return root.get('duck.promise');
    }).then(() => {
      assert.deepEqual_(db._createShoebox(), {
        "documents": [
          {
            "_id": "duck:yellow",
            "_rev": "ignored",
            "type": "duck"
          },
          {
            "_id": "singleton",
            "_transient": true,
            "duck": {
              "isLoaded": true
            },
            "type": "root"
          }
        ]
      });
    });
  });

  test('create shoebox with not loaded relationship', assert => {
    db.transient('root', 'singleton');
    assert.deepEqual_(db._createShoebox(), {
      "documents": [
        {
          "_id": "singleton",
          "_transient": true,
          "duck": {
            "isLoaded": false
          },
          "type": "root"
        }
      ]
    });
  });

  test('push shoebox with loaded', assert => {
    let info = db._pushShoebox({
      documents: [
        {
          "_id": "singleton",
          "_transient": true,
          "duck": {
            "isLoaded": true
          },
          "type": "root"
        }
      ]
    });
    let root = info.models[0].get();
    assert.ok(root);
    assert.ok(root.get('duck._relation').loader.state.isLoaded);
  });

  test('push shoebox not laoded', assert => {
    return db.model('duck', { id: 'yellow' }).save().then(() => {
      let info = db._pushShoebox({
        documents: [
          {
            "_id": "singleton",
            "_transient": true,
            "duck": {
              "isLoaded": false
            },
            "type": "root"
          }
        ]
      });
      let root = info.models[0].get();
      assert.ok(root);
      assert.ok(!root.get('duck._relation').loader.state.isLoaded);
      return root.get('duck.promise');
    });
  });

});

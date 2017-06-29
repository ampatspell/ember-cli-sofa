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
    duck: belongsTo('duck', { inverse: null, relationship: 'all-ducks' })
  });

  const saveDuckAndFlush = () => {
    return db.model('duck', { id: 'random' }).save().then(() => {
      flush();
    });
  }

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

  test('model is initially matched and matched after load', assert => {
    let root;
    return all([ 'yellow', 'red', 'green' ].map(id => db.model('duck', { id }).save())).then(() => {
      root = db.transient('root', 'one');
      assert.equal(root.get('duck.docId'), 'duck:yellow');
      return root.get('duck.promise');
    }).then(() => {
      flush();
      root = db.model('root', 'one');
      assert.equal(root.get('duck.content'), null);
      return root.get('duck.promise');
    }).then(() => {
      assert.equal(root.get('duck.docId'), 'duck:green');
    });
  });

  test('model is matched on create', assert => {
    return saveDuckAndFlush().then(() => {
      db.model('duck', { id: 'yellow' });
      let root = db.model('root');
      assert.equal(root.get('duck.id'), 'yellow');
      return root.get('duck.promise');
    });
  });

  test('created model is matched', assert => {
    return saveDuckAndFlush().then(() => {
      let root = db.model('root');
      assert.equal(root.get('duck.id'), undefined);
      db.model('duck', { id: 'yellow' });
      assert.equal(root.get('duck.id'), 'yellow');
      return root.get('duck.promise');
    });
  });

  test('destroyed isNew model is removed from coll', assert => {
    let root;
    let duck;
    return saveDuckAndFlush().then(() => {
      duck = db.model('duck', { id: 'yellow' });
      root = db.model('root');
      assert.equal(root.get('duck.id'), 'yellow');
      duck.destroy();
      return next();
    }).then(() => {
      assert.equal(root.get('duck.id'), null);
      duck = db.model('duck', { id: 'green' });
      assert.equal(root.get('duck.id'), 'green');
      return root.get('duck.promise');
    });
  });

  test('assign database after model creation', assert => {
    return saveDuckAndFlush().then(() => {
      db.model('duck', { id: 'yellow' });
      let root = store.model('root');
      assert.deepEqual(root.get('duck.id'), undefined);
      root.set('database', db);
      assert.deepEqual(root.get('duck.id'), 'yellow');
      return root.get('duck.promise');
    });
  });

  test('load', assert => {
    let root;
    return all([ 'yellow', 'red', 'green' ].map(id => db.model('duck', { id }).save())).then(() => {
      flush();
      root = db.model('root');
      return root.get('duck.promise');
    }).then(() => {
      assert.deepEqual(root.get('duck.id'), 'green');
    });
  });

  test('autoload', assert => {
    let root;
    return all([ 'yellow', 'red', 'green' ].map(id => db.model('duck', { id }).save())).then(() => {
      flush();
      root = db.model('root');
      assert.deepEqual(root.get('duck').getProperties('isLoaded', 'id'), { isLoaded: false, id: undefined });
      return wait(null, 300);
    }).then(() => {
      assert.deepEqual(root.get('duck').getProperties('isLoaded', 'id'), { isLoaded: true, id: 'green' });
      return root.get('duck.promise');
    });
  });

  test('destroy', assert => {
    let root;
    let relation;
    return all([ 'yellow', 'red', 'green' ].map(id => db.model('duck', { id }).save())).then(() => {
      flush();
      root = db.model('root');
      return root.get('duck.promise');
    }).then(() => {
      assert.equal(root.get('duck.id'), 'green');
      relation = root.get('duck._relation');
      assert.ok(relation);
      root.get('duck').destroy();
      return next();
    }).then(() => {
      assert.ok(!relation.value);
      assert.ok(!root.get('duck').isDestroying);
      assert.ok(relation.value);
    });
  });

});

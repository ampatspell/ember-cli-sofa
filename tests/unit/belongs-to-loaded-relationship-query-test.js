import Ember from 'ember';
import { configurations, registerModels, registerQueries, registerRelationships, cleanup } from '../helpers/setup';
import { Model, Relationship, Query, prefix, belongsTo } from 'sofa';

const {
  computed,
  RSVP: { all }
} = Ember;

/* global emit */
const ddoc = {
  views: {
    'all': {
      map(doc) {
        if(doc.type !== 'house') {
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

  let DuckHouseBig = Query.extend({
    find: computed('model.docId', function() {
      return { ddoc: 'house', view: 'all', key: 'house:big' };
    })
  });

  let DuckHouseSmall = Query.extend({
    find: computed('model.docId', function() {
      return { ddoc: 'house', view: 'all', key: 'house:small' };
    })
  });

  let DuckHouse = Relationship.extend({
    query: 'duck-house-big'
  });

  let Duck = Model.extend({
    id: prefix(),
    house: belongsTo('house', { inverse: 'duck', relationship: 'duck-house' })
  });

  let House = Model.extend({
    id: prefix(),
    duck: belongsTo('duck', { inverse: 'house' })
  });

  function flush() {
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'duck', 'house' ]);
  }

  module('belongs-to-relationship-query', () => {
    registerModels({ Duck, House });
    registerQueries({ DuckHouseBig, DuckHouseSmall });
    registerRelationships({ DuckHouse });
    flush();
    return cleanup(store, [ 'main' ]).then(() => {
      return db.get('documents.design').save('house', ddoc);
    })
  });

  test('duck house has relationship mixin', assert => {
    let duck = db.model('duck', { id: 'yellow' });
    let house = db.model('house', { id: 'big' });
    return all([ duck, house ].map(model => model.save())).then(() => {
      flush();
      return db.load('duck', 'yellow');
    }).then(duck_ => {
      duck = duck_;
      let house = duck.get('house');
      assert.equal(house.get('query'), 'duck-house-big');
      return house.get('promise');
    }).then(() => {
      assert.equal(duck.get('house.docId'), 'house:big');
    });
  });

  test('duck house is reloaded on query change', assert => {
    let duck = db.model('duck', { id: 'yellow' });
    let big = db.model('house', { id: 'big' });
    let small = db.model('house', { id: 'small' });
    return all([ duck, big, small ].map(model => model.save())).then(() => {
      flush();
      return db.load('duck', 'yellow');
    }).then(duck_ => {
      duck = duck_;
      let house = duck.get('house');
      assert.equal(house.get('query'), 'duck-house-big');
      return house.get('promise');
    }).then(() => {
      assert.equal(duck.get('house.docId'), 'house:big');
      duck.set('house.query', 'duck-house-small');
      return duck.get('house.promise');
    }).then(() => {
      assert.equal(duck.get('house.docId'), 'house:small');
    });
  });

});

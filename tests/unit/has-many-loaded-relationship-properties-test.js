/* global emit */
import Ember from 'ember';
import { configurations, registerModels, registerQueries, registerRelationships, cleanup, next } from '../helpers/setup';
import { Relationship, Query, Model, prefix, belongsTo, hasMany } from 'sofa';

const {
  computed,
} = Ember;

const ddoc = {
  views: {
    'by-house': {
      map(doc) {
        if(doc.type !== 'duck') {
          return;
        }
        emit(doc.house, null);
      }
    }
  }
};

configurations(({ module, test, createStore }) => {

  let store;
  let db;

  let HouseDucksQuery = Query.extend({
    find: computed('model.docId', function() {
      let docId = this.get('model.docId');
      return { ddoc: 'ducks', view: 'by-house', key: docId };
    })
  });

  let HouseDucksRelationship = Relationship.extend({
    hello: 'ducks are nice',
  });

  let Duck = Model.extend({
    id: prefix(),
    house: belongsTo('house', { inverse: 'ducks' })
  });

  let House = Model.extend({
    id: prefix(),
    ducks: hasMany('duck', { inverse: 'house', query: 'house-ducks', relationship: 'house-ducks' }),
  });

  function flush() {
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'duck', 'house' ]);
  }

  module('has-many-loaded-relationship-properties', () => {
    registerModels({ Duck, House });
    registerQueries({ HouseDucks: HouseDucksQuery });
    registerRelationships({ HouseDucks: HouseDucksRelationship });
    flush();
    return cleanup(store, [ 'main' ]).then(() => {
      return db.get('documents.design').save('ducks', ddoc);
    });
  });

  test('relationship proxy has properties needed for query', assert => {
    let house = db.model('house', { id: 'big' });
    let ducks = house.get('ducks');

    assert.ok(ducks.get('model'));
    assert.ok(ducks.get('property'));
    assert.ok(ducks.get('database'));
    assert.ok(ducks.get('store'));

    assert.equal(ducks.get('model'), house);
    assert.equal(ducks.get('property'), 'ducks');
    assert.equal(ducks.get('database'), db);
    assert.equal(ducks.get('store'), store);

    return ducks.get('promise');
  });

  test('proxy database prop change', assert => {
    let house = store.model('house', { id: 'big' });
    let ducks = house.get('ducks');

    assert.ok(!ducks.get('database'));

    house.set('database', db);

    assert.ok(ducks.get('database'));
    assert.equal(ducks.get('database'), db);

    return ducks.get('promise');
  });

  test('proxy is destroyed on model destroy', assert => {
    let house = store.model('house', { id: 'big' });
    let ducks = house.get('ducks');

    house.destroy();

    return next().then(() => {
      assert.ok(ducks.get('isDestroying'));
    });
  });

});

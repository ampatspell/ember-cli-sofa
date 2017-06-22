/* global emit */
import Ember from 'ember';
import { configurations, registerModels, registerQueries, registerRelationships, cleanup } from '../helpers/setup';
import { Relationship, Query, Model, prefix, belongsTo, hasMany } from 'sofa';

const {
  get,
  computed,
  RSVP: { all }
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

  let Base = Relationship.extend({
    base: 'all your base belong to us',
    hello: 'ducks are stupid'
  });

  let HouseDucksRelationship = Base.extend({
    hello: 'ducks are nice',
  });

  let HouseDucksRelationshipOther = HouseDucksRelationship.extend({
    hello: 'ducks are nice!',
  });

  let Duck = Model.extend({
    id: prefix(),
    house: belongsTo('house', { inverse: 'ducks' })
  });

  let House = Model.extend({
    id: prefix(),
    ducks: hasMany('duck', { inverse: 'house', query: 'house-ducks', relationship: 'house-ducks' }),
    ducksSame: hasMany('duck', { query: 'house-ducks', relationship: 'house-ducks' }),
    ducksOther: hasMany('duck', { query: 'house-ducks', relationship: 'house-ducks-other' }),
  });

  function flush() {
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'duck', 'house' ]);
  }

  module('has-many-loaded-relationship', () => {
    registerModels({ Duck, House });
    registerQueries({ HouseDucks: HouseDucksQuery });
    registerRelationships({ HouseDucks: HouseDucksRelationship, HouseDucksOther: HouseDucksRelationshipOther });
    flush();
    return cleanup(store, [ 'main' ]).then(() => {
      return db.get('documents.design').save('ducks', ddoc);
    });
  });

  test('ducks has relationship opts prop', assert => {
      let house = db.model('house', { id: 'big' });
      let internal = house.get('_internal');
      assert.equal(internal.definition.property('ducks').opts.relationship, 'house-ducks');
  });

  test('ducks has relationship mixed in', assert => {
    let house = db.model('house', { id: 'big' });
    let ducks = house.get('ducks');
    assert.equal(ducks.get('base'), 'all your base belong to us');
    assert.equal(ducks.get('hello'), 'ducks are nice');
    assert.equal(get(ducks.constructor, 'modelVariant'), 'house-ducks');
    return ducks.get('promise');
  });

  test('two ducks has the same relationship proxy class', assert => {
    let one = db.model('house', { id: 'big' }).get('ducks');
    let two = db.model('house', { id: 'big' }).get('ducks');
    assert.ok(one.constructor === two.constructor);
    return all([ one.get('promise'), two.get('promise') ]);
  });

  test.only('relationship mixin inheritance', assert => {
    let one = db.model('house', { id: 'big' }).get('ducks');
    let two = db.model('house', { id: 'big' }).get('ducksOther');
    let three = db.model('house', { id: 'big' }).get('ducksSame');
    assert.ok(one.constructor !== two.constructor);
    assert.ok(one.constructor === three.constructor);
    assert.equal(one.get('hello'), 'ducks are nice');
    assert.equal(two.get('hello'), 'ducks are nice!');
    assert.equal(three.get('hello'), 'ducks are nice');
    return all([ one.get('promise'), two.get('promise'), three.get('promise') ]);
  });

});

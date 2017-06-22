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

  let Duck = Model.extend({
    id: prefix(),
    house: belongsTo('house', { inverse: 'ducks' })
  });

  let House = Model.extend({
    id: prefix(),
    ducks: hasMany('duck', { inverse: 'house', query: 'house-ducks', relationship: 'house-ducks' })
  });

  function flush() {
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'duck', 'house' ]);
  }

  module('has-many-loaded-relationship', () => {
    registerModels({ Duck, House });
    registerQueries({ HouseDucks: HouseDucksQuery });
    registerRelationships({ HouseDucks: HouseDucksRelationship });
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

  test.only('ducks has relationship mixed in', assert => {
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

  test('hasMany returns proxy', assert => {
    let house = db.model('house', { id: 'big' });
    let ducks = house.get('ducks');
    assert.ok(ducks);
    assert.ok(ducks.get('promise'));
    assert.ok(ducks.get('promise') === ducks.get('promise'));
    return ducks.get('promise').then(proxy => {
      assert.ok(ducks === proxy);
    });
  });

  test('has many loads', assert => {
    let house = db.model('house', { id: 'big' });
    let ducks = [ 'yellow', 'green', 'red' ].map(id => db.model('duck', { id, house }));
    return all([ house.save(), all(ducks.map(duck => duck.save())) ]).then(() => {
      flush();
      return db.load('house', 'big');
    }).then(house_ => {
      house = house_;
      assert.deepEqual(house.get('ducks.state'), {
        "error": null,
        "isError": false,
        "isLoaded": false,
        "isLoading": true
      });
      return house.get('ducks.promise');
    }).then(ducks => {
      assert.ok(ducks);
      assert.deepEqual(ducks.mapBy('id'), [ "green", "red", "yellow" ]);
      assert.deepEqual(ducks.get('state'), {
        "error": false,
        "isError": false,
        "isLoaded": true,
        "isLoading": false
      });
    });
  });

  test('length starts load', assert => {
    let house = db.model('house', { id: 'big' });
    let ducks = [ 'yellow', 'green', 'red' ].map(id => db.model('duck', { id, house }));
    return all([ house.save(), all(ducks.map(duck => duck.save())) ]).then(() => {
      flush();
      return db.load('house', 'big');
    }).then(house => {
      assert.equal(house.get('ducks._relation').loader.state.isLoading, false);
      assert.equal(house.get('ducks.length'), 0);
      assert.equal(house.get('ducks._relation').loader.state.isLoading, true);
      assert.equal(house.get('ducks.isLoading'), true);
      return house.get('ducks.promise').then(() => house);
    }).then(house => {
      assert.equal(house.get('ducks.length'), 3);
      assert.ok(house.get('ducks.isLoaded'));
    });
  });

  test('deleted duck is removed from relationship', assert => {
    let house = db.model('house', { id: 'big' });
    let ducks = [ 'yellow', 'green', 'red' ].map(id => db.model('duck', { id, house }));
    return all([ house.save(), all(ducks.map(duck => duck.save())) ]).then(() => {
      return house.get('ducks.promise');
    }).then(() => {
      assert.ok(house.get('ducks.length') === 3);
      return house.get('ducks').objectAt(2).delete();
    }).then(() => {
      assert.ok(house.get('ducks.length') === 2);
    });
  });

  test('deleted duck is removed from relationship and kept away', assert => {
    let house = db.model('house', { id: 'big' });
    let ducks = [ 'yellow', 'green', 'red' ].map(id => db.model('duck', { id, house }));
    return all([ house.save(), all(ducks.map(duck => duck.save())) ]).then(() => {
      return house.get('ducks').objectAt(2).delete();
    }).then(() => {
      assert.ok(house.get('ducks.length') === 2);
      return house.get('ducks.promise');
    }).then(() => {
      assert.ok(house.get('ducks.length') === 2);
    });
  });

  test('push delete duck', assert => {
    let house = db.model('house', { id: 'big' });
    let ducks = [ 'yellow', 'green', 'red' ].map(id => db.model('duck', { id, house }));
    return all([ house.save(), all(ducks.map(duck => duck.save())) ]).then(() => {
      assert.ok(house.get('ducks.length') === 3);
      assert.ok(!db._modelIdentity.deleted['duck:yellow']);
      return house.get('ducks.promise');
    }).then(() => {
      db.push({ _id: 'duck:yellow', _rev: '3-asdasd', _deleted: true }, { instantiate: false, optional: true });
      assert.ok(house.get('ducks.length') === 2);
      assert.ok(db._modelIdentity.deleted['duck:yellow']);
    });
  });

});

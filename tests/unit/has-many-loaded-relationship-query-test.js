/* global emit */
import Ember from 'ember';
import { configurations, registerModels, registerQueries, registerRelationships, cleanup } from '../helpers/setup';
import { Relationship, Query, Model, prefix, belongsTo, hasMany } from 'sofa';
import HasManyLoaded from 'sofa/properties/relations/has-many-loaded';

const {
  computed,
  RSVP: { all }
} = Ember;

const ducks_ddoc = {
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

const hamsters_ddoc = {
  views: {
    'all': {
      map(doc) {
        if(doc.type !== 'hamster') {
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

  let HouseDucksQuery = Query.extend({
    find: computed('model.docId', function() {
      let docId = this.get('model.docId');
      return { ddoc: 'ducks', view: 'by-house', key: docId };
    })
  });

  let HouseDucksRelationship = Relationship.extend({
    query: 'house-ducks',
  });

  let Duck = Model.extend({
    id: prefix(),
    house: belongsTo('house', { inverse: 'ducks' })
  });

  let House = Model.extend({
    id: prefix(),
    ducks: hasMany('duck', { inverse: 'house', relationship: 'house-ducks' }),
  });

  function flush() {
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'duck', 'house' ]);
  }

  module('has-many-loaded-relationship-query', () => {
    registerModels({ Duck, House });
    registerQueries({ HouseDucks: HouseDucksQuery });
    registerRelationships({ HouseDucks: HouseDucksRelationship });
    flush();
    return cleanup(store, [ 'main' ]).then(() => {
      return all([
        db.get('documents.design').save('ducks', ducks_ddoc),
        db.get('documents.design').save('hamsters', hamsters_ddoc),
      ]);
    });
  });

  test('ducks are HasManyLoaded relation', assert => {
    let house = db.model('house');
    assert.ok(house.get('ducks')._relation.constructor === HasManyLoaded);
  });

  test('has many with query in relationship is not persisted', assert => {
    let house = db.model('house', { id: 'big' });
    let ducks = [ 'yellow', 'green', 'red' ].map(id => db.model('duck', { id, house }));
    return all([ house.save(), all(ducks.map(duck => duck.save())) ]).then(() => {
      return db.get('documents').load('house:big');
    }).then(doc => {
      assert.deepEqual_(doc, {
        "_id": "house:big",
        "_rev": "ignored",
        "type": "house"
      });
    });
  });

  test('ducks load', assert => {
    let house = db.model('house', { id: 'big' });
    let ducks = [ 'yellow', 'green', 'red' ].map(id => db.model('duck', { id, house }));
    return all([ house.save(), all(ducks.map(duck => duck.save())) ]).then(() => {
      flush();
      return db.load('house', 'big');
    }).then(house_ => {
      house = house_;
      return house.get('ducks.promise');
    }).then(ducks => {
      assert.deepEqual(ducks.mapBy('id'), [ "green", "red", "yellow" ]);
    });
  });

  test.only('update query prop marks relationship for reload', assert => {
    let Hamster = Model.extend({
      id: prefix(),
      building: belongsTo('building', { inverse: 'hamsters' })
    });

    let Building = Model.extend({
      id: prefix(),
      hamsters: hasMany('hamster', { inverse: 'building', relationship: 'hamster-buildings' }),
    });

    let HamsterBuildings = Relationship.extend({
      query: 'hamster-buildings-one',
    });

    let HamsterBuildingsOne = Query.extend({
      find: computed('model.docId', function() {
        let docId = this.get('model.docId');
        return { ddoc: 'hamsters', view: 'all', keys: [ 'hamster:green', 'hamster:red' ] };
      })
    });

    let HamsterBuildingsTwo = Query.extend({
      find: computed('model.docId', function() {
        let docId = this.get('model.docId');
        return { ddoc: 'hamsters', view: 'all', keys: [ 'hamster:yellow' ] };
      })
    });

    registerModels({ Hamster, Building });
    registerRelationships({ HamsterBuildings });
    registerQueries({ HamsterBuildingsOne, HamsterBuildingsTwo });

    let building = db.model('building', { id: 'big' });
    let hamsters = [ 'yellow', 'green', 'red' ].map(id => db.model('hamster', { id, building }));
    return all([ building.save(), all(hamsters.map(duck => duck.save())) ]).then(() => {
      flush();
      return db.load('building', 'big');
    }).then(building_ => {
      building = building_;
      return building.get('hamsters.promise');
    }).then(hamsters => {
      assert.deepEqual(hamsters.mapBy('id'), [ "green", "red" ]);
      building.set('hamsters.query', 'hamster-buildings-two');
      return hamsters.get('promise');
    }).then(hamsters => {
      assert.deepEqual(hamsters.mapBy('id'), [ "yellow" ]);
    });
  });

});

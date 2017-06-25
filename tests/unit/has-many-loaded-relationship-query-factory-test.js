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

  let ViewByKey = opts => {
    let { ddoc, view, dep } = opts;
    return Query.extend({
      find: computed(dep, function() {
        let key = this.get(dep);
        return { ddoc, view, key };
      })
    });
  };

  let HouseDucksRelationship = Relationship.extend({
    query: { name: 'view-by-key', ddoc: 'ducks', view: 'by-house', key: 'model.docId' },
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

  module('has-many-loaded-relationship-query-factory', () => {
    registerModels({ Duck, House });
    registerQueries({ ViewByKey });
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

  test('update query prop marks relationship for reload', assert => {
    let Hamster = Model.extend({
      id: prefix(),
      building: belongsTo('building', { inverse: 'hamsters' })
    });

    let Building = Model.extend({
      id: prefix(),
      hamsters: hasMany('hamster', { inverse: 'building', relationship: 'hamster-buildings' }),
    });

    let HamsterBuildings = Relationship.extend({
      query: { name: 'hamster-buildings', keys: [ 'hamster:green', 'hamster:red' ] }
    });

    let HamsterBuildingsQuery = opts => Query.extend({
      find: computed(function() {
        return { ddoc: 'hamsters', view: 'all', keys: opts.keys };
      })
    });

    registerModels({ Hamster, Building });
    registerRelationships({ HamsterBuildings });
    registerQueries({ HamsterBuildings: HamsterBuildingsQuery });

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
      building.set('hamsters.query', { name: 'hamster-buildings', keys: [ 'hamster:yellow' ] });
      return hamsters.get('promise');
    }).then(hamsters => {
      assert.deepEqual(hamsters.mapBy('id'), [ "yellow" ]);
    });
  });

  test('query in relationship opts', assert => {
    let Hamster = Model.extend({
      id: prefix(),
      building: belongsTo('building', { inverse: 'hamsters' })
    });

    let Building = Model.extend({
      id: prefix(),
      hamsters: hasMany('hamster', {
        inverse: 'building',
        query: { name: 'hamster-buildings', keys: [ 'hamster:green', 'hamster:red' ] }
      }),
    });

    let HamsterBuildingsQuery = opts => Query.extend({
      find: computed(function() {
        return { ddoc: 'hamsters', view: 'all', keys: opts.keys };
      })
    });

    registerModels({ Hamster, Building });
    registerQueries({ HamsterBuildings: HamsterBuildingsQuery });

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
    });
  });

});

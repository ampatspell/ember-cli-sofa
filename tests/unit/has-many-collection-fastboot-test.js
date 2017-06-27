/* global emit */
import Ember from 'ember';
import { configurations, registerModels, registerQueries, registerRelationships, cleanup } from '../helpers/setup';
import { Query, Relationship, Model, prefix, belongsTo, hasMany } from 'sofa';

const {
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

  let HouseDucksRelationship = Relationship.extend({
    query: 'house-ducks',
  });

  let Duck = Model.extend({
    id: prefix(),
    house: belongsTo('house')
  });

  let House = Model.extend({
    id: prefix(),
    ducks: hasMany('duck', { inverse: null, relationship: 'house-ducks' })
  });

  function flush() {
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'duck', 'house' ]);
  }

  module('has-many-collection-fastboot', () => {
    registerModels({ Duck, House });
    registerQueries({ HouseDucks: HouseDucksQuery });
    registerRelationships({ HouseDucks: HouseDucksRelationship });
    flush();
    return cleanup(store, [ 'main' ]).then(() => {
      return db.get('documents.design').save('ducks', ddoc);
    });
  });

  test('hasMany serialized for shoebox', assert => {
    let house = db.model('house', { id: 'big' });
    let yellow = db.model('duck', { id: 'yellow', house });
    let green = db.model('duck', { id: 'green', house });
    let red = db.model('duck', { id: 'red', house });
    return all([ house.save(), yellow.save(), green.save(), red.save() ]).then(() => {
      return house.get('ducks.promise');
    }).then(() => {
      assert.deepEqual_(db._createShoebox(), {
        documents: [
          {
            "_attachments": {},
            "_id": "house:big",
            "_rev": "ignored",
            "type": "house",
            "ducks": {
              "isLoaded": true
            }
          },
          {
            "_attachments": {},
            "_id": "duck:yellow",
            "_rev": "ignored",
            "house": "house:big",
            "type": "duck"
          },
          {
            "_attachments": {},
            "_id": "duck:green",
            "_rev": "ignored",
            "house": "house:big",
            "type": "duck"
          },
          {
            "_attachments": {},
            "_id": "duck:red",
            "_rev": "ignored",
            "house": "house:big",
            "type": "duck"
          }
        ]
      });
    });
  });

  test('hasMany with models are loaded', assert => {
    db._pushShoebox({
      documents: [
        { _id: 'house:big', type: 'house', ducks: { isLoaded: true } },
        { _id: 'duck:yellow', type: 'duck', house: 'house:big' },
        { _id: 'duck:green', type: 'duck', house: 'house:big' },
        { _id: 'duck:red', type: 'duck', house: 'house:big' },
      ]
    });
    let house = db.existing('house', 'big');
    assert.ok(house.get('ducks.isLoaded'));
    return house.get('ducks.promise');
  });

  test('hasMany not loaded', assert => {
    return db.model('house', { id: 'big' }).save().then(house => {
      return all([ 'yellow', 'green', 'red' ].map(id => {
        return db.model('duck', { id, house }).save();
      }));
    }).then(() => {
      flush();
      db._pushShoebox({
        documents: [ { _id: 'house:big', type: 'house', ducks: { isLoaded: false } } ]
      });
      let house = db.existing('house', 'big');
      assert.ok(!house.get('ducks.isLoaded'));
      return house.get('ducks.promise').then(() => {
        assert.ok(house.get('ducks.isLoaded'));
        assert.ok(house.get('ducks.length') === 3);
      });
    });
  });

});

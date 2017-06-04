/* global emit */
import Ember from 'ember';
import { configurations, registerModels, registerQueries, registerCollections, cleanup } from '../helpers/setup';
import { Query, Model, Collection, prefix, belongsTo, hasMany } from 'sofa';

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
    },
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

  let HouseDucks = Query.extend({
    find: computed('model.docId', function() {
      let docId = this.get('model.docId');
      return { ddoc: 'ducks', view: 'by-house', key: docId };
    })
  });

  let Duck = Model.extend({
    id: prefix(),
    house: belongsTo('house', { inverse: 'ducks' }),
    home: belongsTo('house', { inverse: 'duck', persist: false })
  });

  let House = Model.extend({
    id: prefix(),
    ducks: hasMany('duck', { inverse: 'house', query: 'house-ducks' }),
    duck: belongsTo('duck', { inverse: 'home' })
  });

  let Ducks = Collection.extend({
    modelName: 'duck',
    queryName: 'all-ducks'
  });

  let AllDucks = Query.extend({
    find: computed(function() {
      return { model: null, ddoc: 'ducks', view: 'all' };
    })
  });

  function flush() {
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'duck', 'house' ]);
  }

  module('fastboot', () => {
    registerModels({ Duck, House });
    registerQueries({ HouseDucks, AllDucks });
    registerCollections({ Ducks });
    flush();
    return cleanup(store, [ 'main' ]).then(() => {
      return db.get('documents.design').save('ducks', ddoc);
    });
  });

  test('db shoebox', assert => {
    let yellow = db.model('duck', { id: 'yellow' });
    let green = db.model('duck', { id: 'green' });
    let red = db.model('duck', { id: 'red' });
    let house = db.model('house', { id: 'big', ducks: [ yellow, green, red ], duck: green });
    db.collection('ducks', { nice: true });
    return all([ house.save(), yellow.save(), green.save(), red.save() ]).then(() => {
      return all([
        house.get('ducks.promise'),
        db.collection('ducks').get('promise')
      ]);
    }).then(() => {
      assert.deepEqual_(db._createShoebox(), {
        "collections": {
          "ducks null": {
            "isLoaded": true
          },
          "ducks {\"nice\":true}": {
            "isLoaded": false
          }
        },
        "documents": [
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
          },
          {
            "_attachments": {},
            "_id": "house:big",
            "_rev": "ignored",
            "duck": "duck:green",
            "ducks": {
              "content": [
                "duck:yellow",
                "duck:green",
                "duck:red"
              ],
              "isLoaded": true
            },
            "type": "house"
          }
        ]
      });
    });
  });

});

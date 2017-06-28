import Ember from 'ember';
import { configurations, registerModels, registerQueries, registerRelationships, cleanup } from '../helpers/setup';
import { Query, Relationship, Model, prefix, hasMany, belongsTo } from 'sofa';

const {
  computed,
  RSVP: { all }
} = Ember;

/* global emit */
let ddocs = [
  {
    name: 'ducks',
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
  }
];

configurations(({ module, test, createStore }) => {

  let store;
  let db;

  module('query-context', () => {
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'duck', 'house' ]);
    return cleanup(store, [ 'main' ]).then(() => {
      return all(ddocs.map(doc => db.get('documents.design').save(doc.name, doc)));
    })
  });

  test('has-many with query', assert => {
    let context;

    let Ducks = Query.extend({
      find: computed('model.docId', function() {
        let relationship = this.get('relationship').getProperties('name', 'database', 'store', 'model');
        let query = this.getProperties('database', 'model', 'store', 'relationship');
        context = { query, relationship };

        let key = this.get('model.docId');
        return { ddoc: 'ducks', view: 'by-house', key };
      })
    });

    let House = Model.extend({
      id: prefix(),
      ducks: hasMany('duck', { inverse: 'house', query: 'ducks' })
    });

    let Duck = Model.extend({
      id: prefix(),
      house: belongsTo('house', { inverse: 'ducks' })
    });

    registerModels({ Duck, House });
    registerQueries({ Ducks });

    let house = db.model('house', { id: 'big' });
    let duck = db.model('duck', { id: 'yellow', house });
    return all([ duck.save(), house.save() ]).then(() => {
      return house.get('ducks.promise');
    }).then(() => {
      assert.deepEqual(context, {
        query: {
          database: db,
          model: house,
          relationship: house.get('ducks'),
          store: store
        },
        relationship: {
          database: db,
          model: house,
          name: 'ducks',
          store: store
        }
      });
    });
  });

  test('has-many with query in relationship', assert => {
    let context;

    let Ducks = Query.extend({
      find: computed('model.docId', function() {
        let relationship = this.get('relationship').getProperties('name', 'database', 'store', 'model');
        let query = this.getProperties('database', 'model', 'store', 'relationship');
        context = { query, relationship };

        let key = this.get('model.docId');
        return { ddoc: 'ducks', view: 'by-house', key };
      })
    });

    let HouseDucks = Relationship.extend({
      query: 'ducks',
    });

    let House = Model.extend({
      id: prefix(),
      ducks: hasMany('duck', { inverse: 'house', relationship: 'house-ducks' })
    });

    let Duck = Model.extend({
      id: prefix(),
      house: belongsTo('house', { inverse: 'ducks' })
    });

    registerModels({ Duck, House });
    registerQueries({ Ducks });
    registerRelationships({ HouseDucks });

    let house = db.model('house', { id: 'big' });
    let duck = db.model('duck', { id: 'yellow', house });
    return all([ duck.save(), house.save() ]).then(() => {
      return house.get('ducks.promise');
    }).then(() => {
      assert.deepEqual(context, {
        query: {
          database: db,
          model: house,
          relationship: house.get('ducks'),
          store: store
        },
        relationship: {
          database: db,
          model: house,
          name: 'ducks',
          store: store
        }
      });
    });
  });

  test('belongs-to with query in relationship', assert => {
    let context;

    let Ducks = Query.extend({
      find: computed('model.docId', function() {
        let relationship = this.get('relationship').getProperties('name', 'database', 'store', 'model');
        let query = this.getProperties('database', 'model', 'store', 'relationship');
        context = { query, relationship };

        let key = this.get('model.docId');
        return { ddoc: 'ducks', view: 'by-house', key };
      })
    });

    let HouseDucks = Relationship.extend({
      query: 'ducks',
    });

    let House = Model.extend({
      id: prefix(),
      duck: belongsTo('duck', { inverse: 'house', relationship: 'house-ducks' })
    });

    let Duck = Model.extend({
      id: prefix(),
      house: belongsTo('house', { inverse: 'ducks' })
    });

    registerModels({ Duck, House });
    registerQueries({ Ducks });
    registerRelationships({ HouseDucks });

    let house = db.model('house', { id: 'big' });
    let duck = db.model('duck', { id: 'yellow', house });
    return all([ duck.save(), house.save() ]).then(() => {
      return house.get('duck.promise');
    }).then(() => {
      assert.deepEqual(context, {
        query: {
          database: db,
          model: house,
          relationship: house.get('duck'),
          store: store
        },
        relationship: {
          database: db,
          model: house,
          name: 'duck',
          store: store
        }
      });
    });
  });

});

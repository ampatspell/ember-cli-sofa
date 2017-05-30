/* global emit */
import Ember from 'ember';
import { configurations, registerModels, registerQueries, cleanup } from '../helpers/setup';
import { Query, Model, prefix, belongsTo, hasMany } from 'sofa';

const {
  computed
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

  let HouseDucks = Query.extend({

    find: computed('model.docId', function() {
      let docId = this.get('model.docId');
      return { ddoc: 'ducks', view: 'by-house', key: docId };
    }),

  });

  let Duck = Model.extend({
    id: prefix(),
    house: belongsTo('house', { inverse: 'ducks' })
  });

  let House = Model.extend({
    id: prefix(),
    ducks: hasMany('duck', { inverse: 'house', query: 'house-ducks' })
  });

  function flush() {
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'duck', 'house' ]);
  }

  module('has-many-loaded-fastboot', () => {
    registerModels({ Duck, House });
    registerQueries({ HouseDucks });
    flush();
    return cleanup(store, [ 'main' ]).then(() => {
      return db.get('documents.design').save('ducks', ddoc);
    });
  });

  test('hasMany with models are loaded', assert => {
    db._pushShoebox([
      { _id: 'house:big', type: 'house' },
      { _id: 'duck:yellow', type: 'duck', house: 'house:big' },
      { _id: 'duck:green', type: 'duck', house: 'house:big' },
      { _id: 'duck:red', type: 'duck', house: 'house:big' },
    ]);
    let house = db.existing('house', 'big');
    assert.ok(house.get('ducks.isLoaded'));
    return house.get('ducks.promise');
  });

});

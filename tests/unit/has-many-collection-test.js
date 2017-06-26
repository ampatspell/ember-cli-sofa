/* global emit */
import Ember from 'ember';
import { configurations, registerModels, registerQueries, cleanup } from '../helpers/setup';
import { Query, Model, prefix, belongsTo, hasMany } from 'sofa';

const {
  computed,
  RSVP: { all }
} = Ember;

const ddoc = {
  views: {
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

  let AllDucks = Query.extend({
    find: computed(function() {
      return { ddoc: 'ducks', view: 'all' };
    })
  });

  let Duck = Model.extend({
    id: prefix(),
  });

  let Root = Model.extend({
    ducks: hasMany('duck', { inverse: null, query: 'all-ducks' })
  });

  function flush() {
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'root', 'duck' ]);
  }

  // from has-many-loaded
  module('has-many-collection', () => {
    registerModels({ Duck, Root });
    registerQueries({ AllDucks });
    flush();
    return cleanup(store, [ 'main' ]).then(() => {
      return db.get('documents.design').save('ducks', ddoc);
    });
  });

  test('models are initially matched', assert => {
    return all([ 'yellow', 'red', 'green' ].map(id => db.model('duck', { id }).save())).then(() => {
      let root = db.model('root');
      assert.deepEqual(root.get('ducks').mapBy('id'), [ 'yellow', 'red', 'green' ]);
      return root.get('ducks.promise');
    });
  });

});

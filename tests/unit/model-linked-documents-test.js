/* global emit */
import Ember from 'ember';
import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, hasMany, belongsTo } from 'sofa';

const {
  RSVP: { all }
} = Ember;

let store;
let db;

const Duck = Model.extend({
  id: prefix(),
  house: belongsTo('house', { inverse: 'ducks' })
});

const House = Model.extend({
  id: prefix(),
  ducks: hasMany('duck', { inverse: 'house', query: 'house-ducks' })
});

const flush = () => {
  store = createStore();
  db = store.get('db.main');
  db.set('modelNames', [ 'house', 'duck' ]);
};

const ddoc = {
  views: {
    'with-house': {
      map(doc) {
        if(doc.type !== 'duck') {
          return;
        }
        emit(doc._id, null);
        emit(doc._id, { _id: doc.house });
      }
    }
  }
};

module('model-linked-documents', () => {
  registerModels({ Duck, House });
  flush();
  return cleanup(store, [ 'main' ]).then(() => {
    return db.get('documents.design').save('duck', ddoc);
  });
});

// { limit: 2, optional: true }
test('load duck using view which also loads house', assert => {
  let house = db.model('house', { id: 'big' });
  let duck = db.model('duck', { id: 'yellow', house });
  return all([ duck, house ].map(model => model.save())).then(() => {
    flush();
    return db.first({ model: 'duck', ddoc: 'duck', view: 'with-house', key: 'duck:yellow', limit: 2, optional: true });
  }).then(model => {
    assert.ok(model);
    assert.ok(model.get('modelName') === 'duck');
    assert.ok(model.get('house.isLoaded') === true);
  });
});

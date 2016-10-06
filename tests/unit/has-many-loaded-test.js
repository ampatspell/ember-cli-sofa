import Ember from 'ember';
import { module, test, createStore, registerModels, registerQueries, cleanup } from '../helpers/setup';
import { Query, Model, prefix, belongsTo, hasMany } from 'sofa';
import { next } from 'sofa/util/run';

const {
  RSVP: { all },
  computed
} = Ember;

let store;
let db;

let HouseDucks = Query.extend({

  find: computed('model.docId', function() {
    let docId = this.get('model.docId');
    return { selector: { house: docId } };
  }),

});

let Duck = Model.extend({
  id: prefix(),
  houseDocId: 'house:big',
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

module('has-many-loaded', () => {
  registerModels({ Duck, House });
  registerQueries({ HouseDucks });
  flush();
  return cleanup(store, [ 'main' ]);
});

test('hasMany returns proxy', assert => {
  let house = db.model('house', { id: 'big' });
  let ducks = house.get('ducks');
  assert.ok(ducks);
});

import Ember from 'ember';
import { module, test, createStore, registerModels, registerQueries, cleanup } from '../helpers/setup';
import { Query, Model, prefix, belongsTo } from 'sofa';

const {
  RSVP: { all },
  computed
} = Ember;

let store;
let db;

let Big = Query.extend({

  find: computed(function() {
    return { selector: { _id: 'house:big' } };
  }),

});

let Duck = Model.extend({
  id: prefix(),
  house: belongsTo('house', { inverse: 'duck', persist: false, query: 'big' })
});

let House = Model.extend({
  id: prefix(),
  duck: belongsTo('duck', { inverse: 'house' })
});

function flush() {
  store = createStore();
  db = store.get('db.main');
  db.set('modelNames', [ 'duck', 'house' ]);
}

module('belongs-to-loaded', () => {
  registerModels({ Duck, House });
  registerQueries({ Big });
  flush();
  return cleanup(store, [ 'main' ]);
});

test('belongsTo returns proxy', assert => {
  let duck = db.model('duck', { id: 'yellow' });
  assert.ok(duck.get('house'));
});

test('belongsTo returns proxy with content', assert => {
  let house = db.model('house', { id: 'big' });
  let duck = db.model('duck', { id: 'yellow', house });
  assert.ok(duck.get('house.content') === house);
});

test('load by using promise property', assert => {
  let duck = db.model('duck', { id: 'yellow' });
  let house = db.model('house', { id: 'big', duck });
  return all([ duck, house ].map(model => model.save())).then(() => {
    flush();
    assert.ok(!db.existing('duck', 'yellow'));
    assert.ok(!db.existing('house', 'big'));
    return db.load('duck', 'yellow');
  }).then(duck_ => {
    duck = duck_;
    return duck.get('house.promise');
  }).then(house => {
    assert.ok(house.get('modelName') === 'house');
    assert.ok(house.get('content') === db.existing('house', 'big'));
    assert.ok(duck.get('house.content') === db.existing('house', 'big'));
  });
});

import Ember from 'ember';
import { configurations, registerModels, registerQueries, cleanup } from '../helpers/setup';
import { Query, Model, prefix, belongsTo } from 'sofa';
import { next } from 'sofa/util/run';

const {
  RSVP: { all },
  computed
} = Ember;

configurations(({ module, test, createStore }) => {

  let store;
  let db;

  let Big = Query.extend({

    find: computed('model.houseDocId', function() {
      let _id = this.get('model.houseDocId');
      return { all: true, key: _id };
    }),

  });

  let Duck = Model.extend({
    id: prefix(),
    houseDocId: 'house:big',
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
    let house = duck.get('house');
    assert.ok(house);
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
      duck.set('houseDocId', 'foof');
      return next().then(() => duck.get('house.promise'));
    }).then(() => {
      assert.ok(false, 'should reject');
    }, err => {
      assert.deepEqual(err.toJSON(), {
        "error": "not_found",
        "reason": "missing"
      });
    });
  });

});

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

  module('belongs-to-loaded-fastboot', () => {
    registerModels({ Duck, House });
    registerQueries({ Big });
    flush();
    return cleanup(store, [ 'main' ]);
  });

  test('loaded belongsTo is marked as loaded', assert => {
    db._pushShoebox([
      {
        _id: "duck:yellow",
        type: "duck",
      },
      {
        _id: "house:big",
        type: "house",
        duck: "duck:yellow"
      }
    ]);
    let house = db.existing('house', 'big');
    assert.ok(house);
    assert.ok(house.get('duck.isLoaded'));
  });

  test('missing belongsTo is marked as not loaded', assert => {
    db._pushShoebox([
      {
        _id: "house:big",
        type: "house",
        duck: "duck:yellow"
      }
    ]);
    let house = db.existing('house', 'big');
    assert.ok(house);
    assert.ok(!house.get('duck.isLoaded'));
  });

});

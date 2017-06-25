import Ember from 'ember';
import { configurations, registerModels, registerCollections, registerQueries, cleanup } from '../helpers/setup';
import { Model, Collection, Query, prefix, type } from 'sofa';

const {
  computed,
  RSVP: { all }
} = Ember;

configurations(({ module, test, createStore }) => {

  let store;
  let classes;

  // let Sections = Collection.extend({
  //   modelName: 'section',
  //   query: { name: 'all-sections', ddoc: 'section', view: 'all' }
  // });

  module('query-create', () => {
    store = createStore();
    classes = store.get('_classes');
  });

  test('create plain query', assert => {
    let Thing = Query.extend({
      info: 'this'
    });
    registerQueries({ Thing });
    let query = store._createQueryForName('thing', {}, 'main', Query => Query);
    assert.ok(query);
    assert.ok(query.get('info') === 'this');
    assert.ok(classes['query:thing:-base']);
    assert.ok(classes['query:thing:main']);
  });

  test('create query using factory', assert => {
    let Thing = opts => Query.extend({
      info: opts.info
    });
    registerQueries({ Thing });
    let query = store._createQuery({ name: 'thing', info: 'this' }, {}, 'main', Query => Query);
    // assert.ok(query);
    // assert.ok(query.get('info') === 'this');
    // assert.ok(classes['query:thing:-base']);
    // assert.ok(classes['query:thing:main']);
  });

});

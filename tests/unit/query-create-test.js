import { configurations, registerQueries } from '../helpers/setup';
import { Query } from 'sofa';

configurations({ only: '1.6' }, ({ module, test, createStore }) => {

  let store;
  let classes;

  module('query-create', () => {
    store = createStore();
    classes = store.get('_classes');
  });

  test('create query with string', assert => {
    let Thing = Query.extend({
      info: 'this'
    });
    registerQueries({ Thing });
    let query = store._createQuery({
      query: 'thing',
      variant: {
        name: 'main',
        prepare: Query => Query
      }
    });
    assert.ok(query);
    assert.ok(query.get('info') === 'this');
    assert.ok(classes['sofa:query/thing']);
    assert.ok(classes['sofa:query/thing/main']);
  });

  test('create query factory with string', assert => {
    let Thing = () => Query.extend({
      info: 'this'
    });
    registerQueries({ Thing });
    let query = store._createQuery({
      query: 'thing',
      variant: {
        name: 'main',
        prepare: Query => Query
      }
    });
    assert.ok(query);
    assert.ok(query.get('info') === 'this');
    assert.ok(classes['sofa:query/thing']);
    assert.ok(classes['sofa:query/thing/main']);
  });

  test('create query factory with options', assert => {
    let Thing = opts => Query.extend({
      info: opts.info
    });
    registerQueries({ Thing });
    let query = store._createQuery({
      query: {
        name: 'thing',
        info: 'that'
      },
      variant: {
        name: 'main',
        prepare: Query => Query
      }
    });
    assert.ok(query);
    assert.ok(query.get('info') === 'that');
    assert.ok(classes['sofa:query/thing/{info=that}']);
    assert.ok(classes['sofa:query/thing/{info=that}/main']);
  });

  test('create query factory with options class is cached', assert => {
    let Thing = opts => Query.extend({
      info: opts.info
    });
    registerQueries({ Thing });

    let one = store._createQuery({
      query: {
        name: 'thing',
        info: 'that'
      },
      variant: {
        name: 'main',
        prepare: Query => Query
      }
    });

    let two = store._createQuery({
      query: {
        name: 'thing',
        info: 'that'
      },
      variant: {
        name: 'main',
        prepare: Query => Query
      }
    });

    assert.ok(one !== two);
    assert.ok(one.constructor === two.constructor);

    assert.ok(classes['sofa:query/thing/{info=that}']);
    assert.ok(classes['sofa:query/thing/{info=that}/main']);
  });

});

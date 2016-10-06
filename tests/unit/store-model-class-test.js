import { module, test, createStore, registerQueries } from '../helpers/setup';
import { Query } from 'sofa';

let store;

let Foo = Query.extend({
});

module('store-model-class', () => {
  store = createStore();
  registerQueries({ Foo });
});

function make(variant, baseFn, variantFn) {
  return store._classForName('query', 'foo', variant, baseFn, variantFn);
}

function makeBase() {
  return make(null, Query => {
    return Query.extend({
      base: 'query',
    });
  });
}

function makeRelation(variant) {
  return make(variant, Query => {
    return Query.extend({
      base: 'query',
    });
  }, Query => {
    return Query.extend({
      variant,
    });
  });
}

function makeRelationFind() {
  return makeRelation('relation-find');
}

function makeRelationFirst() {
  return makeRelation('relation-first');
}

test('lookup', assert => {
  assert.ok(makeRelationFirst() === makeRelationFirst());
  assert.ok(makeRelationFind() === makeRelationFind());
  assert.ok(makeBase() === makeBase());
  assert.ok(makeRelationFind() !== makeRelationFirst());
  assert.ok(makeBase() === makeRelationFirst().superclass);
  assert.deepEqual(store.get('_classes'), {
    'query:foo:-base': makeBase(),
    'query:foo:relation-find': makeRelationFind(),
    'query:foo:relation-first': makeRelationFirst()
  });
});

import { configurations, cleanup } from '../helpers/setup';

configurations(({ module, test, createStore }) => {

  let store;

  function flush() {
    store = createStore();
  }

  module('couch-changes', () => {
    flush();
    return cleanup(store, [ 'main', 'second' ]);
  });

  test('hello', assert => {
    assert.ok(true);
  });

});

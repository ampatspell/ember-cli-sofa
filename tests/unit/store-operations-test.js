import { configurations, cleanup, registerModels } from '../helpers/setup';
import { Model, prefix, belongsTo, hasMany } from 'sofa';

configurations({ only: '1.6' }, ({ module, test, createStore }) => {

  let Duck = Model.extend({
    id: prefix(),
    parent: belongsTo('duck', { inverse: 'kids' }),
    kids: hasMany('duck', { inverse: 'parent', persist: false })
  });

  let store;

  module('store-operations', () => {
    registerModels({ Duck });
    store = createStore();
    return cleanup(store, [ 'main' ]);
  });

  test('exists', assert => {
    let ops = store.get('operations');
    let db = store.get('db.main');
    db.model('duck', { id: 'yellow' }).save();
    db.get('couch.session').save('foo', 'bar');
    assert.ok(ops.get('internalOperations.length') === 2);
    return ops.wait().then(() => {
      assert.ok(ops.get('internalOperations.length') === 0);
    });
  });

});

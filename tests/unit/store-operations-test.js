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
    let db = store.get('db.main');
    db.model('duck', { id: 'yellow' }).save();
    db.get('couch.session').save('foo', 'bar');
    assert.ok(db.get('operations.internalOperations.length') === 1);
    assert.ok(db.get('couch.operations.internalOperations.length') === 1);
    return store.wait().then(() => {
      assert.ok(db.get('operations.internalOperations.length') === 0);
      assert.ok(db.get('couch.operations.internalOperations.length') === 0);
    });
  });

});

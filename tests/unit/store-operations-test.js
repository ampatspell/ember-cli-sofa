import Ember from 'ember';
import { configurations, cleanup, registerModels, next } from '../helpers/setup';
import { Model, prefix, belongsTo, hasMany } from 'sofa';

const {
  RSVP: { all }
} = Ember;

configurations({ only: '1.6' }, ({ module, test, createStore }) => {

  let Duck = Model.extend({
    id: prefix(),
    parent: belongsTo('duck', { inverse: 'kids' }),
    kids: hasMany('duck', { inverse: 'parent', persist: false })
  });

  let store;
  let db;

  const flush = () => {
    store = createStore();
    db = store.get('db.main');
  }

  module('store-operations', () => {
    registerModels({ Duck });
    flush();
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

  test('autoloads', assert => {
    let yellow = db.model('duck', { id: 'yellow' });
    let orange = db.model('duck', { id: 'orange', parent: yellow });
    let green = db.model('duck', { id: 'green', parent: orange });
    let done = false;
    return all([ yellow, orange, green ].map(model => model.save())).then(() => {
      flush();

      db.load('duck', 'green').then(green => {
        return green.get('parent').load();
      }).then(orange => {
        return orange.get('parent').load();
      }).then(yellow => {
        assert.equal(yellow.get('id'), 'yellow');
        return next();
      }).then(() => {
        done = true;
      });

      return store.get('operations').settle();
    }).then(() => {
      assert.ok(done);
    });
  });

});

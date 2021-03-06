import { configurations, registerModels } from '../helpers/setup';
import { Model } from 'sofa';

configurations({ only: '1.6' }, ({ module, test, createStore }) => {

  let store;
  let db;

  let Duck = Model.extend({
  });

  module('identifier', () => {
    registerModels({ Duck });
    store = createStore();
    db = store.get('db.main');
  });

  test('create with value', assert => {
    let model = db.model('duck', { id: 'yellow' });
    assert.ok(model.get('id') === 'yellow');
  });

  test('cannot change after save', assert => {
    let model = db.model('duck', { id: 'yellow' });
    model.set('id', 'green');
    assert.ok(model.get('id') === 'green');

    model.get('_internal').state.isNew = false;

    model.set('id', 'foof');
    assert.ok(model.get('id') === 'green');
  });

});

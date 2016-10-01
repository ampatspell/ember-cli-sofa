import Ember from 'ember';
import { module, test, createStore, registerModels } from '../helpers/setup';
import { Model, attr, prefix } from 'sofa';

const {
  RSVP: { resolve }
} = Ember;

let store;
let db;

let Duck = Model.extend({

  id: prefix(),

});

module('property-prefix', () => {
  registerModels({ Duck });
  store = createStore();
  db = store.get('db.main');
});

test('create with value', assert => {
  let model = db.model('duck', { id: 'yellow' });
  assert.ok(model.get('id') === 'yellow');
  assert.ok(model.get('docId') === 'duck:yellow');

  model.set('id', 'green');

  assert.ok(model.get('id') === 'green');
  assert.ok(model.get('docId') === 'duck:green');
});

test('cannot change after save', assert => {
  let model = db.model('duck', { id: 'yellow' });
  model.set('id', 'green');
  assert.ok(model.get('id') === 'green');
  assert.ok(model.get('docId') === 'duck:green');

  model.get('_internal').state.isNew = false;

  model.set('id', 'foof');
  assert.ok(model.get('id') === 'green');
  assert.ok(model.get('docId') === 'duck:green');
});

import { module, test, createStore, registerModels } from '../helpers/setup';
import Model from 'sofa/model';

let store;
let db;

let Duck = Model.extend({
});

module('model-create', () => {
  registerModels({ Duck });
  store = createStore();
  db = store.get('db.main');
});

test('can be created', assert => {
  let duck = db.model('duck');
  assert.ok(duck);
});

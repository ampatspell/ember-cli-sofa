import { module, test, createStore, registerModels } from '../helpers/setup';
import Model from 'sofa/model';

let store;
let db;

let Duck = Model.extend({

});

module('database-push', () => {
  registerModels({ Duck });
  store = createStore();
  db = store.get('db.main');
});

test('asd', assert => {
  let model = db.push({ _id: 'duck:yellow', type: 'duck', name: 'Yellow Duck' });
  assert.ok(true);
});

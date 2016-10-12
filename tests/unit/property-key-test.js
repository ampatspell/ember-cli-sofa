import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, attr } from 'sofa';

let store;
let db;

let Duck = Model.extend({
  id: prefix(),
  createdAt: attr('date'),
});

module('property-key', () => {
  registerModels({ Duck });
  store = createStore();
  db = store.get('db.main');
  return cleanup(store, [ 'main' ]);
});

test('key is underscored by default', assert => {
  let date = new Date();
  let model = db.model('duck', { createdAt: date });
  assert.deepEqual(model.serialize(true), {
    "_attachments": {},
    "created_at": date.toJSON(),
    "type": "duck"
  });
});

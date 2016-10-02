import { module, test, createStore, registerModels } from '../helpers/setup';
import { Model, prefix, type, attr } from 'sofa';

let store;
let db;

let Duck = Model.extend({

  id: prefix(),
  type: type('the-duck'),
  name: attr('string'),
  age: attr('integer'),

});

module('model-serialize', () => {
  registerModels({ Duck });
  store = createStore();
  db = store.get('db.main');
});

test('serialize', assert => {
  let model = db.model('duck', {
    id: 'yellow',
    name: 'Yellow Duck',
    age: '10'
  });

  assert.deepEqual(model.serialize(), {
    "_id": "duck:yellow",
    "age": 10,
    "name": "Yellow Duck",
    "type": "the-duck"
  });
});

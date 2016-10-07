import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, attr } from 'sofa';

let store;
let db;

let Duck = Model.extend({
  id: prefix(),
});

/*

  let attachments = model.get('attachments');
  attachment = attachments.pushObject({ name, type, data });
  attachments.remove('name');

*/

module('model-attachments', () => {
  registerModels({ Duck });
  store = createStore();
  db = store.get('db.main');
  return cleanup(store, [ 'main' ]);
});

test('get attachments', assert => {
  let model = db.model('duck');
  assert.ok(model.get('attachments'));
  assert.ok(model.get('attachments._internal'));
});

test('add attachment, get attachment', assert => {
  let model = db.model('duck');
  let attachments = model.get('attachments');
  attachments.pushObject({ name: 'note', type: 'text/plain', data: 'hey there' });

  assert.ok(attachments.get('length') === 1);

  let att = attachments.objectAt(0);

  assert.ok(att);
  assert.ok(attachments.get('note') === att);
  assert.ok(attachments.named('note') === att);
});

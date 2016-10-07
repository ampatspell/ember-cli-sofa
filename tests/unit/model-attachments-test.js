import Ember from 'ember';
import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix } from 'sofa';

const {
  RSVP: { resolve }
} = Ember;

let store;
let db;

let Duck = Model.extend({
  id: prefix(),
});

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

test('add marks model dirty', assert => {
  return db.model('duck', { id: 'yellow' }).save().then(duck => {
    assert.ok(duck.get('isDirty') === false);
    duck.get('attachments');
    assert.ok(duck.get('isDirty') === false);
    duck.get('attachments').pushObject({ name: 'note', type: 'text/plain', data: 'heyy' });
    assert.ok(duck.get('isDirty') === true);
  });
});

test('add string', assert => {
  let model = db.model('duck');
  let attachments = model.get('attachments');
  attachments.pushObject({ name: 'note', data: 'hey there' });
  assert.ok(attachments.get('note'));
  assert.ok(attachments.get('note._internal').content.type === 'local');
});

test('add object throws', assert => {
  return resolve().then(() => {
    db.model('duck').get('attachments').pushObject({ name: 'note', data: {} });
  }).then(() => {
    assert.ok(false, 'should reject');
  }, err => {
    assert.deepEqual(err.toJSON(), {
      "error": "invalid_attachment",
      "reason": "unsupported attachment object.data '[object Object]'. data may be String, File or Blob"
    });
  });
});

test.only('string attachment content', assert => {
  let attachments = db.model('duck').get('attachments');
  attachments.pushObject({ name: 'note', data: 'hey there' });
  let attachment = attachments.get('note');
  assert.ok(attachment);
  let content = attachment.get('content');
  assert.ok(content);
  let data = content.get('data');
  assert.ok(data);
});

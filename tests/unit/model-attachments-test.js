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

test('string attachment content', assert => {
  let attachments = db.model('duck').get('attachments');
  attachments.pushObject({ name: 'note', data: 'hey there' });

  let attachment = attachments.get('note');
  assert.ok(attachment);
  assert.ok(attachment.get('name') === 'note');

  let content = attachment.get('content');
  assert.ok(content);
  assert.ok(content.get('type') === 'local');
  assert.ok(content.get('contentType') === 'text/plain');

  let data = content.get('data');
  assert.ok(data === 'hey there');
});

test('init model with attachments', assert => {
  let model = db.model('duck', { attachments: [ { name: 'note', data: 'hey' } ] });
  assert.ok(model.get('attachments.note.data') === 'hey');
});

test('save string attachments saves _attachments in doc', assert => {
  let model = db.model('duck', { id: 'yellow', attachments: [ { name: 'note', data: 'hey' } ] });
  return model.save().then(() => {
    return db.get('documents').load('duck:yellow');
  }).then(doc => {
    assert.deepEqual_(doc, {
      "_attachments": {
        "note": {
          "content_type": "text/plain",
          "digest": "ignored",
          "length": 3,
          "revpos": "ignored",
          "stub": true
        }
      },
      "_id": "duck:yellow",
      "_rev": "ignored",
      "type": "duck"
    });
  });
});

test.only('save with attachment is reloaded and attachment content is replaced with stub', assert => {
  let model = db.model('duck', { id: 'yellow', attachments: [ { name: 'note', data: 'hey' } ] });
  let string = model.get('attachments.note.content');
  assert.ok(model.get('attachments.note.type') === 'local');
  return model.save().then(() => {
    let stub = model.get('attachments.note.content');
    assert.ok(string !== stub);
    assert.ok(model.get('attachments.note.type') === 'remote');
    let att = model.get('attachments.note');
    assert.ok(att.get('digest'));
    assert.ok(att.get('revpos'));
    assert.ok(att.get('length') === 3);
  });
});

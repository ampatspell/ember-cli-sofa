import Ember from 'ember';
import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix } from 'sofa';
import createBlob from 'sofa/util/create-blob';

const {
  RSVP: { resolve }
} = Ember;

let store;
let db;

let Duck = Model.extend({
  id: prefix(),
});

const flush = () => {
  store = createStore();
  db = store.get('db.main');
};

module('model-attachments', () => {
  registerModels({ Duck });
  flush();
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

test('save with attachment is reloaded and attachment content is replaced with stub', assert => {
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

test('resave does not break attachments', assert => {
  let model = db.model('duck', { id: 'yellow', attachments: [ { name: 'note', data: 'hey' } ] });
  return model.save().then(() => {
    return model.save({ force: true });
  }).then(() => {
    assert.ok(model.get('attachments.note.length') === 3);
    return model.reload();
  }).then(() => {
    assert.ok(model.get('attachments.note.length') === 3);
  });
});

test('load with attachment', assert => {
  let model = db.model('duck', { id: 'yellow', attachments: [ { name: 'note', data: 'hey' } ] });
  return model.save().then(() => {
    flush();
    return db.load('duck', 'yellow');
  }).then(model => {
    assert.ok(model.get('attachments.note'));
    assert.ok(model.get('attachments.note.length') === 3);
    assert.ok(model.get('attachments.note.contentType') === 'text/plain');
  });
});

test('delete attachment', assert => {
  let model = db.model('duck', { id: 'yellow', attachments: [ { name: 'note', data: 'hey' }, { name: 'greeting', data: 'yaay' } ] });
  return model.save().then(() => {
    assert.ok(!model.get('isDirty'));
    model.get('attachments').removeAt(0);
    assert.ok(model.get('isDirty'));
    return model.save();
  }).then(() => {
    assert.ok(!model.get('attachments.note'));
    assert.ok(model.get('attachments.greeting'));
    return db.get('documents').load('duck:yellow');
  }).then(doc => {
    assert.deepEqual_(doc, {
      "_attachments": {
        "greeting": {
          "content_type": "text/plain",
          "digest": "ignored",
          "length": 4,
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

test('deserialize with deleted attachment', assert => {
  let model = db.model('duck', { id: 'yellow', attachments: [ { name: 'note', data: 'hey' }, { name: 'greeting', data: 'yaay' } ] });
  return model.save().then(() => {
    return db.get('documents').load('duck:yellow');
  }).then(doc => {
    delete doc._attachments.note;
    return db.get('documents').save(doc);
  }).then(() => {
    return model.reload();
  }).then(() => {
    assert.ok(!model.get('attachments.note'));
    assert.ok(model.get('attachments.greeting'));
  });
});

test('save blob', assert => {
  let data = createBlob('hey there', 'text/plain');
  let model = db.model('duck', { id: 'yellow', attachments: [ { name: 'blob', data } ] });
  return model.save().then(() => {
    return db.get('documents').load('duck:yellow');
  }).then(doc => {
    assert.deepEqual_(doc, {
      "_attachments": {
        "blob": {
          "content_type": "text/plain",
          "digest": "ignored",
          "length": 9,
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

test('blob content', assert => {
  let data = createBlob('hey there', 'text/plain');
  let model = db.model('duck', { id: 'yellow', attachments: [ { name: 'blob', data } ] });
  let att = model.get('attachments.blob');
  assert.ok(att.get('contentType') === 'text/plain');
  assert.ok(att.get('length') === 9);
});

test('file url promise', assert => {
  let data = createBlob('hey there', 'text/plain');
  let model = db.model('duck', { id: 'yellow', attachments: [ { name: 'blob', data } ] });
  let att = model.get('attachments.blob');
  assert.ok(!att.get('url'));
  return att.get('promise').then(string => {
    assert.equal(string, 'data:text/plain;base64,aGV5IHRoZXJl');
    assert.equal(att.get('url'), 'data:text/plain;base64,aGV5IHRoZXJl');
  });
});

test('file url is autoloaded', assert => {
  let data = createBlob('hey there', 'text/plain');
  let model = db.model('duck', { id: 'yellow', attachments: [ { name: 'blob', data } ] });
  let att = model.get('attachments.blob');
  assert.ok(!att.get('url'));
  return wait().then(() => {
    assert.equal(att.get('url'), 'data:text/plain;base64,aGV5IHRoZXJl');
  });
});

test('stub has url', assert => {
  let model = db.model('duck', { id: 'yellow', attachments: [ { name: 'note', data: 'hey' } ] });
  return model.save().then(() => {
    assert.equal(model.get('attachments.note.url'), '/api/ember-cli-sofa-test-main/duck%3Ayellow/note?_r=1');
  });
});

test('file has array buffer promise', assert => {
  let data = createBlob('hey there', 'text/plain');
  let model = db.model('duck', { id: 'yellow', attachments: [ { name: 'blob', data } ] });
  let att = model.get('attachments.blob');
  return att.get('arrayBuffer').then(arrayBuffer => {
    assert.ok(arrayBuffer instanceof ArrayBuffer);
    assert.ok(arrayBuffer.byteLength === 9);
  });
});

test.only('file has base64 promise', assert => {
  let data = createBlob('hey there', 'text/plain');
  let model = db.model('duck', { id: 'yellow', attachments: [ { name: 'blob', data } ] });
  let att = model.get('attachments.blob');
  return att.get('base64').then(string => {
    assert.equal(string, 'aGV5IHRoZXJl');
  });
});

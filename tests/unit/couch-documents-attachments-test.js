import { configurations, cleanup } from '../helpers/setup';
import createBlob from 'sofa/util/create-blob';

configurations(({ module, test, createStore }) => {

  let store;
  let docs;

  module('couch-documents-attachments', () => {
    store = createStore();
    docs = store.get('db.main.documents');
    return cleanup(store, [ 'main' ]);
  });

  test('save doc with attachment', assert => {
    return docs.save({
      _id: 'thing',
      _attachments: {
        original: {
          content_type: 'text/plain',
          data: 'hey there'
        }
      }
    }).then(resp => {
      assert.deepEqual_({
        "ok": true,
        "id": "thing",
        "rev": "ignored",
        "reload": true,
      }, resp);

      return docs.load('thing');
    }).then(doc => {
      assert.deepEqual_({
        "_attachments": {
          "original": {
            "content_type": "text/plain",
            "digest": "md5-NGYAayuBwPH5Ikr7+6OUFA==",
            "length": 9,
            "revpos": 1,
            "stub": true
          }
        },
        "_id": "thing",
        "_rev": "ignored"
      }, doc);
    });
  });

  test('save doc with stubs', assert => {
    return docs.save({
      _id: 'thing',
      _attachments: {
        original: {
          content_type: 'text/plain',
          data: 'hey there'
        }
      }
    }).then(() => {
      return docs.load('thing');
    }).then(doc => {
      return docs.save(doc);
    }).then(data => {
      assert.deepEqual_({
        "id": "thing",
        "ok": true,
        "rev": "ignored"
      }, data);
    });
  });

  test('save doc without id', assert => {
    return docs.save({
      _attachments: {
        original: {
          content_type: 'text/plain',
          data: 'hey there'
        }
      }
    }).then(data => {
      assert.ok(data.id.length === 32);
    });
  });

  test('save doc with file attachment', assert => {
    let blob = createBlob('<h1>hey</h1>', 'text/html');
    return docs.save({
      _id: 'hello',
      _attachments: {
        original: {
          data: blob
        }
      }
    }).then(() => {
      return docs.load('hello');
    }).then(doc => {
      assert.deepEqual_({
        "_attachments": {
          "original": {
            "content_type": "text/html",
            "digest": "ignored",
            "length": 12,
            "revpos": "ignored",
            "stub": true
          }
        },
        "_id": "hello",
        "_rev": "ignored"
      }, doc);
    });
  });

  test('save text with special chars', assert => {
    return docs.save({
      _id: 'hello',
      _attachments: {
        text: {
          content_type: 'text/plain',
          data: 'āšūč or something'
        }
      }
    }).then(() => {
      return docs.load('hello').then(doc => {
        assert.deepEqual_({
          "_attachments": {
            "text": {
              "content_type": "text/plain",
              "digest": "ignored",
              "length": 21,
              "revpos": "ignored",
              "stub": true
            }
          },
          "_id": "hello",
          "_rev": "ignored"
        }, doc);
      });
    });
  });

});

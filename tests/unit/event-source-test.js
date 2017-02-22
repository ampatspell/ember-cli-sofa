import { configurations, cleanup, wait } from '../helpers/setup';
import Listener from 'sofa/couch/changes/event-source';

configurations({ only: '1.6' }, ({ module, test, createStore }) => {

  let store;
  let db;

  function flush() {
    store = createStore();
    db = store.get('db.main');
  }

  module('event-source', () => {
    flush();
    return cleanup(store, [ 'main' ]);
  });

  test('listen save and delete', assert => {
    let docs = db.get('documents');
    let listener = new Listener(`${docs.get('url')}/_changes?feed=eventsource&include_docs=true&since=now`);
    let data = [];
    listener.delegate = {
      onData(listener_, json) {
        assert.ok(listener_ === listener);
        data.push(json);
      }
    };
    listener.start();
    assert.equal(listener.started, true);
    return wait().then(() => {
      return docs.save({ _id: 'foo', type: 'thing' });
    }).then(json => {
      return docs.delete('foo', json.rev);
    }).then(() => {
      return wait();
    }).then(() => {
      assert.equal(listener.open, true);
      listener.stop();
      assert.deepEqual_(data.map(row => row.doc), [
        {
          "_id": "foo",
          "_rev": "ignored",
          "type": "thing"
        },
        {
          "_deleted": true,
          "_id": "foo",
          "_rev": "ignored"
        }
      ]);
    });
  });

});

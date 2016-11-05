import Ember from 'ember';
import { module, test, createStore, registerModels, registerQueries, cleanup, wait } from '../helpers/setup';
import { Query, Model, prefix, belongsTo, hasMany } from 'sofa';
import Listener from 'sofa/couch/changes/event-source';

const {
  computed,
  RSVP: { all }
} = Ember;

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

test.skip('listen', assert => {
  let docs = db.get('documents');
  let listener = new Listener(`${docs.get('url')}/_changes?feed=eventsource&include_docs=true&since=now`);
  listener.start();
  console.log('started');
  assert.equal(listener.started, true);
  return wait().then(() => {
    return docs.save({ _id: 'foo' });
  }).then(() => {
    console.log('saved');
    return wait();
  }).then(() => {
    assert.equal(listener.open, true);
    listener.stop();
  });
});

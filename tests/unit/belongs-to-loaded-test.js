import Ember from 'ember';
import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, belongsTo } from 'sofa';

const {
  RSVP: { all }
} = Ember;

let store;
let db;

/*

// queries/duck-house.js
export default Query.extend({

  find: computed('parent.id', function() {
    let docId = this.get('parent.docId');
    return { selector: { _id: docId } };
  }),

});

*/

let Duck = Model.extend({
  id: prefix(),
  house: belongsTo('house', { inverse: 'duck', query: 'duck-house' })
});

let House = Model.extend({
  id: prefix(),
  duck: belongsTo('duck', { inverse: 'house' })
});

function flush() {
  store = createStore();
  db = store.get('db.main');
  db.set('modelNames', [ 'duck', 'house' ]);
}

module('belongs-to-loaded', () => {
  registerModels({ Duck, House });
  flush();
  return cleanup(store, [ 'main' ]);
});

test('belongsTo with queyr returns proxy', assert => {
  let duck = db.model('duck', { id: 'yellow' });
  assert.ok(duck.get('house'));
});

// test.only('load', assert => {
//   let house = db.model('house', { id: 'big' });
//   let duck = db.model('duck', { id: 'yellow', house });
//   return all([ duck, house ].map(model => model.save())).then(() => {
//     flush();
//   });
// });

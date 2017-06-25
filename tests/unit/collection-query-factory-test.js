import Ember from 'ember';
import { configurations, registerModels, registerCollections, registerQueries, cleanup } from '../helpers/setup';
import { Model, Collection, Query, prefix, type } from 'sofa';

const {
  computed,
  RSVP: { all }
} = Ember;

configurations(({ module, test, createStore }) => {

  let store;
  let db;

  let Section = Model.extend({
    id: prefix()
  });

  let Placeholder = Section.extend({
    id: prefix('section:placeholder:'),
    type: type('section:placeholder')
  });

  let Duck = Model.extend({
  });

  let AllSections = opts => {
    let { ddoc, view } = opts;
    return Query.extend({
      find: computed(function() {
        return { model: null, ddoc, view };
      })
    });
  };

  let Sections = Collection.extend({
    modelName: 'section',
    query: { name: 'all-sections', ddoc: 'section', view: 'all' }
  });

  let flush = () => {
    store = createStore();
    db = store.get('db.main');
    db.set('modelNames', [ 'section', 'placeholder', 'duck' ]);
  };

  let ddoc = {
    views: {
      all: {
        map(doc) {
          if(doc.type.split(':')[0] !== 'section') {
            return;
          }
          /* global emit */
          emit(doc._id, null);
        }
      }
    }
  };

  module('collection-query-factory', () => {
    registerModels({ Section, Placeholder, Duck });
    registerCollections({ Sections });
    registerQueries({ AllSections });
    flush();
    return cleanup(store, [ 'main' ]).then(() => {
      return db.get('documents.design').save('section', ddoc);
    });
  });

  test.skip('load by getting promise', assert => {
    let collection;
    return all([
      db.model('placeholder', { id: 'one' }).save(),
      db.model('duck', { id: 'one' }).save()
    ]).then(() => {
      flush();
      collection = db.collection('sections');
      return collection.get('promise');
    }).then(arg => {
      assert.ok(arg === collection);
      assert.ok(collection.get('length') === 1);
      assert.ok(collection.get('firstObject.modelName') === 'placeholder');
      assert.deepEqual(collection.get('state'), {
        "error": false,
        "isError": false,
        "isLoaded": true,
        "isLoading": false
      });
    });
  });

});

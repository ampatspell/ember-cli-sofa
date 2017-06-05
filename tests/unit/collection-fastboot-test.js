import Ember from 'ember';
import { configurations, registerModels, registerCollections, registerQueries, cleanup } from '../helpers/setup';
import { Model, Collection, Query, prefix, type } from 'sofa';

const {
  computed
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

  let AllSections = Query.extend({

    find: computed(function() {
      return { model: null, ddoc: 'section', view: 'all' };
    }),

  });

  let Sections = Collection.extend({
    modelName: 'section',
    queryName: 'all-sections'
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

  module('collection-fastboot', () => {
    registerModels({ Section, Placeholder, Duck });
    registerCollections({ Sections });
    registerQueries({ AllSections });
    flush();
    return cleanup(store, [ 'main' ]).then(() => {
      return db.get('documents.design').save('section', ddoc);
    });
  });

  test('collection is loaded after fastboot push', assert => {
    db._pushShoebox({
      "documents":[
        {
          "_id": "section:placeholder:one",
          "_rev":"75-78a44ca631c66a6215c0d379bcead8bd",
          "_attachments": {},
          "type": "section:placeholder"
        }
      ],
      "collections":{
        "sections null": {
          "isLoaded": true
        }
      }
    });
    let collection = db.collection('sections');
    assert.ok(collection._internal.loader.state.isLoaded);
  });

});

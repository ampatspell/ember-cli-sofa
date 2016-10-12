import { module, test, createStore, registerModels, registerCollections, cleanup } from '../helpers/setup';
import { Model, Collection, prefix, type } from 'sofa';

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

let Sections = Collection.extend({
  modelName: 'section'
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

module('collection-inheritance', () => {
  registerModels({ Section, Placeholder, Duck });
  registerCollections({ Sections });
  flush();
  return cleanup(store, [ 'main' ]).then(() => {
    return db.get('documents.design').save('section', ddoc);
  });
});

test('db.find with base class as a model', assert => {
  let placeholder = db.model('placeholder', { id: 'one' });
  return placeholder.save().then(() => {
    flush();
    return db.find({ model: 'section', ddoc: 'section', view: 'all' });
  }).then(models => {
    assert.ok(models.get('length') === 1);
    let model = models[0];
    assert.ok(model.get('modelName'), 'placeholder');
  });
});

test('db.find without model', assert => {
  let placeholder = db.model('placeholder', { id: 'one' });
  return placeholder.save().then(() => {
    flush();
    return db.find({ ddoc: 'section', view: 'all' });
  }).then(models => {
    assert.ok(models.get('length') === 1);
    let model = models[0];
    assert.ok(model.get('modelName'), 'placeholder');
  });
});

test('collection model is base class', assert => {
  let sections = db.collection('sections');
  assert.ok(sections.get('length') === 0);
  let placeholder = db.model('placeholder', { id: 'one' });
  db.model('duck');
  assert.ok(sections.get('length') === 1);
  assert.ok(sections.get('lastObject') === placeholder);
});

test('collection has initial content', assert => {
  let placeholder = db.model('placeholder', { id: 'one' });
  db.model('duck');
  let sections = db.collection('sections');
  assert.ok(sections.get('length') === 1);
  assert.ok(sections.get('lastObject') === placeholder);
});

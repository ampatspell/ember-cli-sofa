import { configurations, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix } from 'sofa';

configurations(({ module, test, createStore }) => {

  let store;
  let db;

  let Duck = Model.extend({
    id: prefix(),
  });

  const flush = () => {
    store = createStore();
    db = store.get('db.main');
    db.attachmentUrlForOptions = function({ database, doc, attachment }) {
      return `${database.get('documents.url')}/attachment/${attachment.name}/${doc.id}?_r=${attachment.revpos}`;
    }.bind(db);
  };

  module('model-attachment-custom-url-test', () => {
    registerModels({ Duck });
    flush();
    return cleanup(store, [ 'main' ]);
  });

  test('custom url for stubs', assert => {
    let model = db.model('duck', { id: 'yellow' });
    model.get('attachments').pushObject({ name: 'note', type: 'text/plain', data: 'hey there' });
    return model.save().then(() => {
      assert.equal(model.get('attachments.note.url'), `${db.get('documents.url')}/attachment/note/duck%3Ayellow?_r=1`);
    });
  });

});


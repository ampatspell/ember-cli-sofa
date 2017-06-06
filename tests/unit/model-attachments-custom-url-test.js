import Ember from 'ember';
import { configurations, registerModels, cleanup, register } from '../helpers/setup';
import { Model, Stub, prefix } from 'sofa';

const {
  computed
} = Ember;

configurations(({ module, test, createStore, config }) => {

  let store;
  let db;

  let Duck = Model.extend({
    id: prefix(),
  });

  let MainStub = Stub.extend({
    url: computed('attachment.name', 'attachment.attachments.model.{database.documents.url,encodedDocId}', 'revpos', function() {
      let name = this.get('attachment.name');
      let revpos = this.get('revpos');
      let db = this.get('attachment.attachments.model.database.documents.url');
      let docId = this.get('attachment.attachments.model.encodedDocId');
      return `${db}/attachment/${name}/${docId}?_r=${revpos}`;
    }).readOnly()
  });

  const flush = () => {
    store = createStore();
    db = store.get('db.main');
  };

  module('model-attachment-custom-url-test', () => {
    registerModels({ Duck });
    register('sofa/database:main/attachment/content/stub', MainStub);
    flush();
    return cleanup(store, [ 'main' ]);
  });

  test('lookup custom attachment class', assert => {
    let Factory = store._lookupAttachmentContentClass(db, 'stub');
    assert.ok(MainStub.detect(Factory.class));
  });

  test('lookup default attachemnt content class', assert => {
    let Factory = store._lookupAttachmentContentClass(store.get('db.second'), 'stub');
    assert.ok(!MainStub.detect(Factory.class));
  });

  test('custom url for stubs', assert => {
    let model = db.model('duck', { id: 'yellow' });
    model.get('attachments').pushObject({ name: 'note', type: 'text/plain', data: 'hey there' });
    return model.save().then(() => {
      assert.equal(model.get('attachments.note.url'), `${config.url}/ember-cli-sofa-test-main/attachment/note/duck%3Ayellow?_r=1`);
      db.get('documents').set('name', 'ember-cli-sofa-test-second');
      assert.equal(model.get('attachments.note.url'), `${config.url}/ember-cli-sofa-test-second/attachment/note/duck%3Ayellow?_r=1`);
    });
  });

});

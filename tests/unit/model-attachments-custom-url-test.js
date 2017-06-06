import Ember from 'ember';
import { configurations, registerModels, cleanup, register } from '../helpers/setup';
import { Model, Stub, prefix } from 'sofa';

const {
  computed
} = Ember;

configurations(({ module, test, createStore }) => {

  let store;
  let db;

  let Duck = Model.extend({
    id: prefix(),
  });

  let MainStub = Stub.extend({
    url: computed('attachment.name', 'revpos', function() {
      let name = this.get('attachment.name');
      let revpos = this.get('revpos');
      return `/${name}?_r=${revpos}`;
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

  test.todo('custom url for stubs', assert => {
    let model = db.model('duck', { id: 'yellow' });
    model.get('attachments').pushObject({ name: 'note', type: 'text/plain', data: 'hey there' });
    return model.save().then(() => {
      assert.equal(model.get('attachments.note.url'), `${db.get('documents.url')}/attachment/note/duck%3Ayellow?_r=1`);
    });
  });

});

import Ember from 'ember';
import { configurations, registerModels, cleanup, register } from '../helpers/setup';
import { Model, AttachmentStubContent, Attachments, Attachment, prefix } from 'sofa';

const {
  computed
} = Ember;

configurations(({ module, test, createStore, config }) => {

  let store;
  let db;

  let Duck = Model.extend({
    id: prefix(),
  });

  let MainAttachments = Attachments.extend({
  });

  let MainAttachment = Attachment.extend({
  });

  let MainStub = AttachmentStubContent.extend({
  });

  const flush = () => {
    store = createStore();
    db = store.get('db.main');
  };

  module('model-attachment-custom-classes', () => {
    registerModels({ Duck });
    register('sofa/database:main/attachment/content/stub', MainStub);
    register('sofa/database:main/attachments', MainAttachments);
    register('sofa/database:main/attachment', MainAttachment);
    flush();
    return cleanup(store, [ 'main' ]);
  });

  test('lookup attachment content', assert => {
    let Factory = store._lookupAttachmentContentClass(db, 'stub');
    assert.ok(MainStub.detect(Factory.class));
  });

  test('lookup attachment', assert => {
    let Factory = store._lookupAttachmentClass(db);
    assert.ok(MainAttachment.detect(Factory.class));
  });

  test('lookup attachment content', assert => {
    let Factory = store._lookupAttachmentsClass(db);
    assert.ok(MainAttachments.detect(Factory.class));
  });

});

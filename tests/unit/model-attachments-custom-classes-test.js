import { configurations, registerModels, cleanup, register } from '../helpers/setup';
import { Model, AttachmentStubContent, Attachments, Attachment, prefix } from 'sofa';

configurations(({ module, test, createStore }) => {

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

  test('saved', assert => {
    let model = db.model('duck', { id: 'yellow' });
    assert.ok(MainAttachments.detectInstance(model.get('attachments')));
    model.get('attachments').pushObject({ name: 'original', data: 'hello', content_type: 'text/plain' });
    assert.ok(MainAttachment.detectInstance(model.get('attachments.original')));
    return model.save().then(() => {
      assert.ok(MainStub.detectInstance(model.get('attachments.original.content')));
    });
  });

});

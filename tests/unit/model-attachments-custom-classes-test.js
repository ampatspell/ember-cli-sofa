import { configurations, registerModels, cleanup, register } from '../helpers/setup';
import { Model, AttachmentStubContent, AttachmentStringContent, Attachments, Attachment, prefix } from 'sofa';

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

  let MainString = AttachmentStringContent.extend({
  });

  const flush = () => {
    store = createStore();
    db = store.get('db.main');
  };

  module('model-attachment-custom-classes', () => {
    registerModels({ Duck });
    register('sofa/database:main/attachment/content/stub', MainStub);
    register('sofa/database:main/attachment/content/string', MainString);
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

  test('set database after model creation', assert => {
    let model = store.model('duck', { id: 'yellow' });

    assert.ok(!model.get('database'));

    assert.ok(Attachments.detectInstance(model.get('attachments')));

    model.get('attachments').pushObject({ name: 'original', data: 'hello', content_type: 'text/plain' });

    assert.ok(Attachment.detectInstance(model.get('attachments.original')));
    assert.ok(AttachmentStringContent.detectInstance(model.get('attachments.original.content')));

    model.set('database', db);

    assert.ok(MainAttachments.detectInstance(model.get('attachments')));
    assert.ok(MainAttachment.detectInstance(model.get('attachments.original')));
    assert.ok(MainString.detectInstance(model.get('attachments.original.content')));

    return model.save().then(() => {
      assert.ok(MainStub.detectInstance(model.get('attachments.original.content')));
    });
  });

});

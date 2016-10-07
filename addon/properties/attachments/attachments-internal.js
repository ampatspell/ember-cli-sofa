import Ember from 'ember';
import { isObject_, isString_, assert } from '../../util/assert';
import AttachmentInternal from './attachment-internal';

const {
  getOwner
} = Ember;

export default class AttachmentsInternal {

  constructor(internalModel, property) {
    this.internalModel = internalModel;
    this.attachmentsModel = null;
    this.property = property;
    this.content = Ember.A();
  }

  dirty() {
    let internal = this.internalModel;
    internal.withPropertyChanges(changed => {
      internal.onDirty(changed);
    }, true);
  }

  createAttachmentsModel() {
    let _internal = this;
    let content = this.content;
    return getOwner(this.property.store).lookup('sofa:attachments').create({ _internal, content });
  }

  getAttachmentsModel() {
    let model = this.attachmentsModel;
    if(!model) {
      model = this.createAttachmentsModel();
      model.addEnumerableObserver(this, {
        willChange: this.attachmentModelsWillChange,
        didChange: this.attachmentModelsDidChange
      });
      this.attachmentsModel = model;
    }
    return model;
  }

  createAttachmentInternalFromHash(hash) {
    isObject_(`attachment must be object { name, type, data } not ${hash}`, hash);
    isString_(`attachment.name must be string not ${hash.name}`, hash.name);
    return new AttachmentInternal(this, hash.name, hash);
  }

  getAttachmentInternalByName(name) {
    return this.content.find(internal => internal.name === name);
  }

  //

  willRemoveAttachment(attachment) {
    attachment.destroy();
    this.dirty();
  }

  didAddAttachment(attachment) {
    assert(`attachment '${attachment.name}' is already assigned to ${attachment.attachments.internalModel.modelName} with id '${attachment.attachments.internalModel.docId}'`, attachment.attachments === this);
    this.dirty();
  }

  //

  attachmentModelsWillChange(proxy, removing) {
    removing.forEach(model => {
      let internal = model._internal;
      this.willRemoveAttachment(internal);
    });
  }

  attachmentModelsDidChange(proxy, removeCount, adding) {
    adding.forEach(model => {
      let internal = model._internal;
      this.didAddAttachment(internal);
    });
  }

}

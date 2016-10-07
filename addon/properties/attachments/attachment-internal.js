import Ember from 'ember';
import createContentInternal from './content/create-internal';

const {
  getOwner
} = Ember;

export default class Attachment {

  constructor(attachments, name, hash) {
    this.attachments = attachments;
    this.name = name;
    this.content = this.createContentForHash(hash);
    this.attachmentModel = null;
  }

  get key() {
    return this.name;
  }

  createContentForHash(hash) {
    return createContentInternal(this, hash);
  }

  createAttachmentModel() {
    let _internal = this;
    return getOwner(this.attachments.internalModel.store).lookup('sofa:attachment').create({ _internal });
  }

  getAttachmentModel() {
    let model = this.attachmentModel;
    if(!model) {
      model = this.createAttachmentModel();
      this.attachmentModel = model;
    }
    return model;
  }

  getAttachmentContentModel() {
    return this.content.getContentModel();
  }

  serialize(preview) {
    let key = this.key;
    let value = this.content.serialize(preview);
    return {
      key,
      value
    };
  }

  destroy() {
    this.content.destroy();
    if(this.attachmentModel) {
      this.attachmentModel.destroy();
      this.attachmentModel = null;
    }
  }

}

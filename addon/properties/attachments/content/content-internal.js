import Ember from 'ember';

const {
  getOwner
} = Ember;

export default class AttachmentContent {

  constructor(attachment) {
    this.attachment = attachment;
    this.type = 'local';
    this.contentModel = null;
  }

  createContentModel() {
    let name = this.contentModelName;
    let owner = this.attachment.attachments.internalModel.store;
    let _internal = this;
    return getOwner(owner).lookup(`sofa:attachment-content/${name}`).create({ _internal });
  }

  getContentModel() {
    let model = this.contentModel;
    if(!model) {
      model = this.createContentModel();
      this.contentModel = model;
    }
    return model;
  }

}

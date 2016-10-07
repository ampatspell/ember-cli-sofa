import Ember from 'ember';

const {
  getOwner
} = Ember;

export default class Attachment {

  constructor(attachments, name, type, data) {
    this.attachments = attachments;
    this.attachmentModel = null;
    this.name = name;
    this.type = type;
    this.data = data;
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

}

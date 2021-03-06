import createContentInternal from './content/create-internal';

export default class Attachment {

  constructor(attachments, name, hash) {
    this.attachments = attachments;
    this.name = name;
    this.content = this.createContentForHash(hash);
    this.attachmentModel = null;
  }

  get isStubContent() {
    return this.content.isStub;
  }

  createContentForHash(hash) {
    return createContentInternal(this, hash);
  }

  lookupAttachmentClass() {
    let model = this.attachments.internalModel;
    return model.store._lookupAttachmentClass(model.database);
  }

  createAttachmentModel() {
    let _internal = this;
    return this.lookupAttachmentClass().create({ _internal });
  }

  getAttachmentModel() {
    let model = this.attachmentModel;
    if(!model) {
      model = this.createAttachmentModel();
      this.attachmentModel = model;
    }
    return model;
  }

  notifyAttachmentModelContentDidChange() {
    let model = this.attachmentModel;
    if(!model) {
      return;
    }
    model.notifyPropertyChange('content');
  }

  getAttachmentContentModel() {
    return this.content.getContentModel();
  }

  serialize(type) {
    let name = this.name;
    let value = this.content.serialize(type);
    return {
      name,
      value
    };
  }

  deserialize(value) {
    if(this.content.isStub) {
      this.content.deserialize(value);
    } else {
      this.content.destroy();
      this.content = this.createContentForHash(value);
      this.notifyAttachmentModelContentDidChange();
    }
  }

  destroyAttachmentModel() {
    if(!this.attachmentModel) {
      return;
    }
    this.attachmentModel.destroy();
    this.attachmentModel = null;
  }

  destroy() {
    this.content.destroy();
    this.destroyAttachmentModel();
  }

  onModelDestroyed() {
    this.content.onModelDestroyed();
    this.destroyAttachmentModel();
  }

  onDidSetDatabase() {
    let attachmentModel = this.attachmentModel;
    if(!attachmentModel) {
      return;
    }

    let Factory = this.lookupAttachmentClass();
    let recreate = !Factory.class.detectInstance(attachmentModel);

    this.content.onDidSetDatabase();

    if(recreate) {
      this.destroyAttachmentModel();
    }
  }

}

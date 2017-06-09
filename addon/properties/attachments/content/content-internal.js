export default class AttachmentContent {

  constructor(attachment) {
    this.attachment = attachment;
    this.type = 'local';
    this.contentModel = null;
  }

  lookupAttachmentContentClass() {
    let model = this.attachment.attachments.internalModel;
    let name = this.contentModelName;
    return model.store._lookupAttachmentContentClass(model.database, name);
  }

  createContentModel() {
    let _internal = this;
    return this.lookupAttachmentContentClass().create({ _internal });
  }

  getContentModel() {
    let model = this.contentModel;
    if(!model) {
      model = this.createContentModel();
      this.contentModel = model;
    }
    return model;
  }

  withPropertyChanges(cb) {
    let model = this.contentModel;

    if(model && model.isDestroying) {
      model = null;
    }

    if(model) {
      model.beginPropertyChanges();
    }

    let changed = (key) => {
      if(!key) {
        return;
      }
      if(model) {
        model.notifyPropertyChange(key);
      }
    };

    cb(changed);

    if(model) {
      model.endPropertyChanges();
    }
  }

  destroyContentModel() {
    if(!this.contentModel) {
      return;
    }
    this.contentModel.destroy();
    this.contentModel = null;
  }

  destroy() {
    this.destroyContentModel();
  }

  onModelDestroyed() {
    this.destroyContentModel();
  }

  onDidSetDatabase() {
    let contentModel = this.contentModel;
    if(!contentModel) {
      return;
    }

    let Factory = this.lookupAttachmentContentClass();
    let recreate = !Factory.class.detectInstance(contentModel);

    if(recreate) {
      this.destroyContentModel();
    }
  }

}

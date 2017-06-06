export default class AttachmentContent {

  constructor(attachment) {
    this.attachment = attachment;
    this.type = 'local';
    this.contentModel = null;
  }

  createContentModel() {
    let name = this.contentModelName;
    let internalModel = this.attachment.attachments.internalModel;
    let store = internalModel.store;
    let database = internalModel.database;
    let _internal = this;
    return store._lookupAttachmentContentClass(database, name).create({ _internal });
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

}

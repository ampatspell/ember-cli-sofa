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
    return getOwner(owner).factoryFor(`sofa:attachment-content/${name}`).create({ _internal });
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

import Ember from 'ember';
import { isObject_ } from '../../util/assert';
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

  createAttachmentsModel() {
    let _internal = this;
    let content = this.content;
    return getOwner(this.property.store).lookup('sofa:attachments').create({ _internal, content });
  }

  getAttachmentsModel() {
    let model = this.attachmentsModel;
    if(!model) {
      model = this.createAttachmentsModel();
      this.attachmentsModel = model;
    }
    return model;
  }

  createAttachmentInternalFromHash(hash) {
    isObject_(`attachment must be object { name, type, data } not ${hash}`, hash);
    return new AttachmentInternal(this, hash.name, hash.type, hash.data);
  }

  getAttachmentInternalByName(name) {
    return this.content.find(internal => internal.name === name);
  }

}

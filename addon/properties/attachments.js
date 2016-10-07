import Ember from 'ember';
import Property from './property';
import AttachmentsInternal from './attachments/attachments-internal';

const {
  merge,
  Logger: { error },
  K
} = Ember;

export default class Attachments extends Property {

  constructor(opts) {
    super(merge({ key: '_attachments' }, opts));
  }

  get requiredPropertyName() {
    return 'attachments';
  }

  get requiredDocumentKey() {
    return '_attachments';
  }

  get setsModelInitialValueFromOptions() {
    return false;
  }

  createAttachmentsInternal(internal) {
    return new AttachmentsInternal(internal, this);
  }

  getAttachmentsInternal(internal, create=true) {
    let attachments = this.getInternalValue(internal);
    if(!attachments && create) {
      attachments = this.createAttachmentsInternal(internal);
      this.setInternalValue(internal, attachments, K);
    }
    return attachments;
  }

  _setValue(internal, value) {
    // TODO: replace attachments
    if(this.getInternalValue(internal)) {
      error(`Attempted to set attachments for model ${internal.modelName} with id ${internal.docId}`);
      this.notifyPropertyChange(internal);
    } else {
      let attachments = this.getAttachmentsInternal(internal);
      attachments.addAttachmentHashes(value);
    }
    return this.getValue(internal);
  }

  _getValue(internal) {
    return this.getAttachmentsInternal(internal).getAttachmentsModel();
  }

  _serialize(internal, doc, preview) {
    let attachments = this.getAttachmentsInternal(internal, false);

    let value = {};

    if(attachments) {
      value = attachments.serialize(preview);
    }

    if(preview && Object.keys(value) === 0) {
      value = undefined;
    }

    this.setDocValue(doc, value);
  }

  _deserialize(internal, doc, changed) {
    let attachments = this.getInternalValue(internal);

    if(Object.keys(doc._attachments) === 0 && !attachments) {
      return;
    }

    if(!attachments) {
      attachments = this.getAttachmentsInternal();
    }

    let value = this.getDocValue(doc);
    attachments.deserialize(value, changed);

    return this.opts.key;
  }

}

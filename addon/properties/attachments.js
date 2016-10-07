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

  getAttachmentsInternal(internal) {
    let attachments = this.getInternalValue(internal);
    if(!attachments) {
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

}

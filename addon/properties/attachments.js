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

  _setValue(internal) {
    error(`Cannot set model attachments for model ${internal.modelName} with id ${internal.docId}`);
    this.notifyPropertyChange(internal);
    return this.getValue(internal);
  }

  _getValue(internal) {
    return this.getAttachmentsInternal(internal).getAttachmentsModel();
  }

}

import Ember from 'ember';
import Property from './property';

const {
  merge
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

}

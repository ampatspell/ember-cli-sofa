import Ember from 'ember';
import Attribute from './attribute';

const {
  merge
} = Ember;

export default class Revision extends Attribute {

  constructor(opts) {
    super('string', merge({ fallback: undefined, key: '_rev' }, opts));
  }

  get requiredPropertyName() {
    return 'rev';
  }

}

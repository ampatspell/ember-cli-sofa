import Ember from 'ember';
import Property from './property';

const {
  merge
} = Ember;

export default class Attribute extends Property {

  constructor(transform, opts) {
    super(merge({ transform }, opts));
  }

}

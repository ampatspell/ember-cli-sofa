import Ember from 'ember';
import Transform from './transform';

const {
  copy
} = Ember;

export default class IntegerTransform extends Transform {

  toModel(value, attr) {
    var number = parseInt(value);
    if(isNaN(number)) {
      return copy(attr.opts.fallback);
    }
    return number;
  }

}

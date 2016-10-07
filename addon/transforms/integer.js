import Ember from 'ember';
import SimpleTransform from './simple';

const {
  copy
} = Ember;

export default class IntegerTransform extends SimpleTransform {

  transform(value, opts) {
    var number = parseInt(value);
    if(isNaN(number)) {
      return copy(opts.fallback);
    }
    return number;
  }

}

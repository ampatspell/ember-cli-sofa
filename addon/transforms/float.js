import Ember from 'ember';
import SimpleTransform from './simple';
import round from '../util/round';

const {
  copy
} = Ember;

export default class FloatTransform extends SimpleTransform {

  transform(value, opts) {
    var number = parseFloat(value);
    if(isNaN(number)) {
      return copy(opts.fallback);
    }
    let decimals = opts.round;
    if(decimals) {
      number = round(number, decimals);
    }
    return number;
  }

}

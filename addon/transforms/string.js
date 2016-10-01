import Ember from 'ember';
import Transform from './transform';

const {
  typeOf,
  copy
} = Ember;

export default class StringTransform extends Transform {

  toModel(value, attr) {
    let type = typeOf(value);

    if(type === 'string') {
      return value;
    }

    if(type === 'undefined' || type === 'null') {
      return copy(attr.opts.fallback);
    }

    if(typeOf(value.toString) === 'function') {
      return value.toString();
    }

    return '' + value;
  }

}

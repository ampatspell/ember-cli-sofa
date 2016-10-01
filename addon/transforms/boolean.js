import Ember from 'ember';
import Transform from './transform';

const {
  copy
} = Ember;

export default class BooleanTransform extends Transform {

  toModel(value, attr) {
    if(value === undefined || value === null) {
      return copy(attr.opts.fallback);
    }
    return !!value;
  }

}

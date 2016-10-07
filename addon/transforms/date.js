import Ember from 'ember';
import Transform from './transform';

const {
  typeOf,
  copy
} = Ember;

export default class DateTransform extends Transform {

  _validDate(date) {
    if(isNaN(date.getTime())) {
      return null;
    }
    return date;
  }

  toModel(value, attr) {
    let type = typeOf(value);
    if(type === 'date') {
      return this._validDate(value);
    }
    if(type === 'string') {
      let date = new Date(value);
      return this._validDate(date);
    }
    return null;
  }

  toDocument(value) {
    if(value) {
      return value.toJSON();
    }
    return value;
  }

}

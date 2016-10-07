import Ember from 'ember';
import SimpleTransform from './simple';

const {
  copy,
  Logger: { error }
} = Ember;

export default class JSONTransform extends SimpleTransform {

  transform(value, opts) {
    try {
      let string = JSON.stringify(value);
      if(string === undefined) {
        return undefined;
      }
      return JSON.parse(string);
    } catch(err) {
      error(`Error transforming json: ${err.message}`, value);
      return null;
    }
  }

}

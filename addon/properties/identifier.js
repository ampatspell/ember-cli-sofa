import Ember from 'ember';
import Attribute from './attribute';
import { assert } from '../util/assert';

const {
  merge,
  typeOf,
  Logger: { error }
} = Ember;

export default class Identifier extends Attribute {

  constructor(opts) {
    super('string', merge({ key: '_id', fallback: undefined }, opts));
  }

  get requiredPropertyName() {
    return 'id';
  }

  docId(modelClass, modelId) {
    return modelId;
  }

  modelId(modelClass, docId) {
    return docId;
  }

  // validateValue(model, value) {
  //   if(!model.get('isNew')) {
  //     error(`Model id cannot be changed after model is saved. Attempted to set id '${value}' for ${model} with id '${model.get('id')}'`);
  //     this.notifyPropertyChange(model);
  //     return false;
  //   }
  //   return true;
  // }

  // setValue(model, value) {
  //   if(!this.validateValue(model, value)) {
  //     return this.getDataValue(model);
  //   }
  //   return super.setValue(model, value);
  // }

  // validateId(id, preview=false) {
  //   let test;

  //   test = typeOf(id) === 'string' && id.length > 0;
  //   if(!preview) {
  //     assert({ error: 'invalid_id', reason: 'id cannot be empty' }, test);
  //   } else if(!test) {
  //     return false;
  //   }

  //   test = id.trim().length === id.length;
  //   if(!preview) {
  //     assert({ error: 'invalid_id', reason: 'id cannot have extra whitespace' }, test);
  //   } else if(!test) {
  //     return false;
  //   }

  //   return true;
  // }

  // serialize(model, doc, preview=false) {
  //   let docId = this.getDataValue(model);
  //   if(typeOf(docId) !== 'undefined') {
  //     this.validateId(docId, preview);
  //   }
  //   super.serialize(model, doc);
  // }

}

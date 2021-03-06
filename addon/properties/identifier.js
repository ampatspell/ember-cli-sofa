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

  get lazyLoadsModel() {
    return false;
  }

  docId(modelClass, modelId) {
    return modelId;
  }

  modelId(modelClass, docId) {
    return docId;
  }

  validateValue(internal, value) {
    if(!internal.state.isNew && value !== this.getInternalValue(internal)) {
      error(`Model id cannot be changed after model is saved. Attempted to set id '${value}' for ${internal.modelName} with id '${internal.getValue('id')}'`);
      this.notifyPropertyChange(internal);
      return false;
    }
    return true;
  }

  setValue(internal, value, changed) {
    if(!this.validateValue(internal, value)) {
      return this.getValue(internal);
    }
    return super.setValue(internal, value, changed);
  }

  validateId(id, type) {
    let test;

    test = typeOf(id) === 'string' && id.length > 0;

    if(type === 'document') {
      assert({ error: 'invalid_id', reason: 'id cannot be empty' }, test);
    } else if(!test) {
      return false;
    }

    test = id.trim().length === id.length;

    if(type === 'document') {
      assert({ error: 'invalid_id', reason: 'id cannot have extra whitespace' }, test);
    } else if(!test) {
      return false;
    }

    return true;
  }

  serialize(internal, doc, type) {
    let docId = this.getInternalValue(internal);
    if(typeOf(docId) !== 'undefined') {
      this.validateId(docId, type);
    }
    super.serialize(internal, doc, type);
  }

}

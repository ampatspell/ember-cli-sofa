import Ember from 'ember';
import Attribute from './attribute';
import assert from '../util/assert';

const {
  merge,
  get
} = Ember;

export default class Identifier extends Attribute {

  constructor(value, opts) {
    super('string', merge({ value }, opts));
  }

  get requiredPropertyName() {
    return 'type';
  }

  get setsModelInitialValueFromOptions() {
    return false;
  }

  valueForModelClass(modelClass) {
    return this.opts.value || get(modelClass, 'modelName');
  }

  serialize(internal, doc) {
    let value = this.valueForModelClass(internal.modelClass);
    this.setDocValue(doc, value);
  }

  // matchesDocument(modelClass, doc) {
  //   let expected = this.valueForModelClass(modelClass);
  //   let value = doc[this.opts.key];
  //   return expected === value;
  // }

  // setValue(model, value) {
  //   var expected = this.valueForModelClass(model.constructor);
  //   assert(`Type value must be '${expected}'`, expected === value);
  //   return super.setValue(...arguments);
  // }

  // getValue(model) {
  //   return this.valueForModelClass(model.constructor);
  // }

}

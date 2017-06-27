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

  get lazyLoadsModel() {
    return false;
  }

  valueForModelClass(modelClass) {
    return this.opts.value || get(modelClass.class, 'modelName');
  }

  serialize(internal, doc) {
    let value = this.valueForModelClass(internal.modelClass);
    this.setDocValue(doc, value);
  }

  matchesDocument(modelClass, doc={}) {
    let expected = this.valueForModelClass(modelClass);
    let value = this.getDocValue(doc);
    return expected === value;
  }

  setValue(internal, value) {
    var expected = this.valueForModelClass(internal.modelClass);
    assert(`Type value must be '${expected}'`, expected === value);
    return super.setValue(...arguments);
  }

  getValue(internal) {
    return this.valueForModelClass(internal.modelClass);
  }

  getDocumentKeyValue(modelClass) {
    let key = this.opts.key;
    let value = this.valueForModelClass(modelClass);
    return { key, value };
  }

}

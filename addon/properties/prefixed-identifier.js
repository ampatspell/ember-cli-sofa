import Ember from 'ember';
import Identifier from './identifier';

const {
  merge,
  get,
  assert
} = Ember;

export default class PrefixedIdentifier extends Identifier {

  constructor(value, opts) {
    super(merge({ value }, opts));
  }

  prefix(modelClass) {
    return this.opts.value || `${get(modelClass, 'modelName')}:`;
  }

  docId(modelClass, modelId) {
    if(!modelId) {
      return undefined;
    }
    let prefix = this.prefix(modelClass);
    return `${prefix}${modelId}`;
  }

  modelId(modelClass, docId) {
    if(!docId) {
      return undefined;
    }
    let prefix = this.prefix(modelClass);
    assert(`document id '${docId}' must start with '${prefix}' prefix`, docId.indexOf(prefix) === 0);
    return docId.substr(prefix.length);
  }

  serialize(internal, doc, preview) {
    let modelId = this.getInternalValue(internal);
    if(this.validateId(modelId, preview)) {
      let docId = this.docId(internal.modelClass, modelId);
      this.setDocValue(doc, docId);
    }
  }

  // deserialize(model, doc) {
  //   let docId = this.getDocValue(doc);
  //   let modelId = this.modelId(model.constructor, docId);
  //   model.set(this.name, modelId);
  // }

}

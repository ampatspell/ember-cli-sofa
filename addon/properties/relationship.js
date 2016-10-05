import Ember from 'ember';
import Property from './property';

const {
  merge,
  K
} = Ember;

export default class Relationship extends Property {

  constructor(relationshipModelName, opts) {
    super(merge({ relationshipModelName }, opts));
  }

  get relationshipModelClass() {
    let modelClass = this.opts.relationshipModelClass;
    if(!modelClass) {
      modelClass = this.store.modelClassForName(this.opts.relationshipModelName);
      this.opts.relationshipModelClass = modelClass;
    }
    return modelClass;
  }

  getRelation(internal) {
    let relation = this.getInternalValue(internal);
    if(!relation) {
      relation = this.createRelation(internal);
      this.setInternalValue(internal, relation, K);
    }
    return relation;
  }

  _getValue(internal) {
    let relation = this.getRelation(internal);
    return relation.getValue();
  }

  _setValue(internal, value, changed) {
    let relation = this.getRelation(internal);
    return relation.setValue(value, changed);
  }

  _serialize(internal, doc) {
    let relation = this.getRelation(internal);
    let value = relation.serialize();
    if(value !== undefined) {
      this.setDocValue(doc, value);
    }
  }

  _deserialize(internal, doc, changed) {
    let value = this.getDocValue(doc);
    let relation = this.getRelation(internal);
    relation.deserialize(value, changed);
    return this.opts.key;
  }

  onDeleted(internal) {
    this.getRelation(internal).onDeleted();
  }

}

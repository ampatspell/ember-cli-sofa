import Ember from 'ember';
import Property from './property';

const {
  merge
} = Ember;

const noop = () => {};

export default class Relationship extends Property {

  constructor(relationshipModelName, opts) {
    super(merge({ relationshipModelName }, opts));
  }

  getRelation(internal) {
    let relation = this.getInternalValue(internal);
    if(!relation) {
      relation = this.createRelation(internal);
      this.setInternalValue(internal, relation, noop);
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

}

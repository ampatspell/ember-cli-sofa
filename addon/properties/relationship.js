import Ember from 'ember';
import Property from './property';

const {
  merge,
} = Ember;

const K = () => undefined;

export default class Relationship extends Property {

  constructor(relationshipModelName, opts={}) {
    delete opts.initial;
    super(merge({ polymorphic: false, relationshipModelName }, opts));
  }

  modelClassForName(modelName) {
    return this.store.modelClassForName(modelName);
  }

  get relationshipModelName() {
    return this.opts.relationshipModelName;
  }

  get relationshipModelClass() {
    let modelClass = this.opts.relationshipModelClass;
    if(!modelClass && modelClass !== null) {
      let modelName = this.opts.relationshipModelName;
      if(modelName) {
        modelClass = this.modelClassForName(modelName);
      } else {
        modelClass = null;
      }
      this.opts.relationshipModelClass = modelClass;
    }
    return modelClass;
  }

  getRelationshipDatabase(internal) {
    let identifier = this.opts.database;
    if(identifier) {
      return this.store.database(identifier);
    }
    return internal.database;
  }

  getRelation(internal, create=true) {
    let relation = this.getInternalValue(internal);
    if(!relation && create) {
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
    relation.setValue(value, changed);
    return relation.getValue();
  }

  setInitialValue(internal, value, changed) {
    let relation = this.getRelation(internal);
    relation.setValue(value, changed);
  }

  _serialize(internal, doc, type) {
    let relation = this.getRelation(internal);
    let value = relation.serialize(type);
    if(value !== undefined) {
      this.setDocValue(doc, value);
    }
  }

  _deserialize(internal, doc, changed, type) {
    let value = this.getDocValue(doc);
    let relation = this.getRelation(internal);
    relation.deserialize(value, changed, type);
    return this.opts.key;
  }

  onDeleted(internal) {
    this.getRelation(internal).onDeleted();
  }

  modelWillDestroy(internal) {
    if(!internal.state.isNew) {
      return;
    }
    let relation = this.getRelation(internal, false);
    if(relation) {
      relation.modelWillDestroy();
    }
  }

}

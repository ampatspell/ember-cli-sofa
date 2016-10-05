import Ember from 'ember';
import InternalModel, { getInternalModel } from '../../internal-model';
import Model from '../../model';

const {
  assert
} = Ember;

export default class Relation {

  constructor(relationship, internal) {
    this.relationship = relationship;
    this.internal = internal;
    this.value = null;
  }

  get relationshipModelClass() {
    return this.relationship.relationshipModelClass;
  }

  get database() {
    return this.internal.database;
  }

  getInverseRelation(internal) {
    if(!internal) {
      return;
    }
    let key = this.relationship.opts.inverse;
    if(!key) {
      return;
    }
    return internal.getRelation(key);
  }

  deserializeDocIdToInternalModel(docId) {
    let internal = this.database._deserializeDocIdToInternalModel(this.relationshipModelClass, docId);
    if(internal.state.isDeleted) {
      return null;
    }
    return internal;
  }

  serializeInternalModelToDocId(internal) {
    if(!internal) {
      return null;
    }
    if(internal.state.isDeleted) {
      return null;
    }
    let docId = internal.docId;
    return docId || null;
  }

  toInternalModel(object) {
    if(object instanceof InternalModel) {
      return object;
    }
    if(Ember.ObjectProxy.detectInstance(object)) {
      object = object.get('content');
    }
    assert(`ObjectProxy.content is ObjectProxy`, !Ember.ObjectProxy.detectInstance(object));
    if(Model.detectInstance(object)) {
      return getInternalModel(object);
    }
    return null;
  }

}

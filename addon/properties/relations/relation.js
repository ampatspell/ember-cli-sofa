import InternalModel, { getInternalModel } from '../../internal-model';
import Model from '../../model';

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

  deserializeDocIdToInternalModel(docId) {
    return this.database._deserializeDocIdToInternalModel(this.relationshipModelClass, docId);
  }

  toInternalModel(object) {
    if(object instanceof InternalModel) {
      return object;
    }
    if(Model.detectInstance(object)) {
      return getInternalModel(object);
    }
    return null;
  }

}

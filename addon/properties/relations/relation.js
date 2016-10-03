export default class Relation {

  constructor(relationship, internal) {
    this.relationship = relationship;
    this.internal = internal;
    this.value = null;
  }

  internalModelWithDocId(docId) {
    if(!docId) {
      return null;
    }
    let database = this.internal.database;
    let modelClass = this.relationship.relationshipModelClass;
    let modelId = database._definitionForModelClass(modelClass).modelId(docId);
    return database._existingInternalModelForModelClass(modelClass, modelId, { create: true, deleted: true });
  }

}

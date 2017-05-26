import BelongsToRelation from './belongs-to';

export default class BelongsToPersistedRelation extends BelongsToRelation {

  serialize(type) {
    return this.serializeInternalModelToDocId(this.content, type);
  }

  deserialize(value, changed) {
    let internal = null;
    if(value) {
      internal = this.deserializeDocIdToInternalModel(value);
    }
    this.setContent(internal, changed);
  }

}

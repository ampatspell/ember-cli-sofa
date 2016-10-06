import BelongsToRelation from './belongs-to';

export default class BelongsToPersistedRelation extends BelongsToRelation {

  serialize(preview) {
    return this.serializeInternalModelToDocId(this.getContent(), preview);
  }

  deserialize(value, changed) {
    let internal = null;
    if(value) {
      internal = this.deserializeDocIdToInternalModel(value);
    }
    this.setContent(internal, changed);
  }

}

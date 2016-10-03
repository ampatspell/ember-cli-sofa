import BelongsToRelation from './belongs-to';

export default class BelongsToPersistedRelation extends BelongsToRelation {

  serialize() {
    return this.serializeInternalModelToDocId(this.value);
  }

  deserialize(value, changed) {
    let internal = null;
    if(value) {
      internal = this.deserializeDocIdToInternalModel(value);
    }
    this.setValue(internal, changed);
  }

}

import BelongsToRelation from './belongs-to';

export default class BelongsToPersistedRelation extends BelongsToRelation {

  serialize() {
    let value = this.value;
    if(value) {
      return value.docId;
    }
    return null;
  }

  deserialize(value, changed) {
    let internal = null;
    if(value) {
      internal = this.deserializeDocIdToInternalModel(value);
    }
    this.setValue(internal, changed);
  }

}

import BelongsToRelation from './belongs-to';

export default class BelongsToPersistedRelation extends BelongsToRelation {

  serialize() {
    let value = this.value;
    if(value) {
      return value.get('docId');
    }
    return null;
  }

  deserialize(value, changed) {
    let model = null;
    if(value) {
      let internal = this.internalModelWithDocId(value);
      model = internal.getModel();
    }
    this.setValue(model, changed);
  }

}

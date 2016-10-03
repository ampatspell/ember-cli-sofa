import BelongsToRelation from './belongs-to';

export default class BelongsToPersistedRelation extends BelongsToRelation {

  serialize() {
    let value = this.value;
    if(value) {
      return value.get('docId');
    }
    return null;
  }

}

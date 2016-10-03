import Relation from './relation';

export default class BelongsToRelation extends Relation {

  getValue() {
    return this.value;
  }

  setValue(value, changed) {
    if(this.value === value) {
      return;
    }
    this.value = value || null;
    changed(this.internal.name);
  }

  serialize() {
  }

  deserialize() {
  }

}

import Relation from './relation';

export default class BelongsToRelation extends Relation {

  // TODO: internal -> model
  getValue() {
    return this.value;
  }

  // TODO: model -> internal
  setValue(value, changed) {
    if(this.value === value) {
      return;
    }
    this.value = value || null;
    changed();
  }

  serialize() {
  }

  deserialize() {
  }

}

import Relation from './relation';

export default class BelongsToRelation extends Relation {

  getValue() {
    let internal = this.value;
    if(!internal) {
      return null;
    }
    return internal.getModel();
  }

  setValue(value, changed) {
    let internal = this.toInternalModel(value);
    if(this.value === value) {
      return;
    }
    this.value = internal;
    changed();
  }

}

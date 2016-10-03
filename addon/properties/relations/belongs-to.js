import Relation from './relation';

export default class BelongsToRelation extends Relation {

  inverseWillChange(internal) {
    this.withPropertyChange(changed => {
      this.setValue(null, changed);
    }, true);
  }

  inverseDidChange(internal) {
    this.withPropertyChange(changed => {
      this.setValue(internal, changed);
    }, true);
  }

  willSetValue() {
    let inverse = this.getInverseRelation(this.value);
    if(inverse) {
      inverse.inverseWillChange(this.internal);
    }
  }

  didSetValue() {
    let inverse = this.getInverseRelation(this.value);
    if(inverse) {
      inverse.inverseDidChange(this.internal);
    }
  }

  getValue() {
    let internal = this.value;
    if(!internal) {
      return null;
    }
    return internal.getModel();
  }

  setValue(value, changed) {
    if(this.isSettingValue) {
      return;
    }

    this.isSettingValue = true;

    let internal = this.toInternalModel(value);
    if(this.value !== internal) {
      this.willSetValue();
      this.value = internal;
      changed();
      this.didSetValue();
    }

    this.isSettingValue = false;

    return value || null;
  }

}

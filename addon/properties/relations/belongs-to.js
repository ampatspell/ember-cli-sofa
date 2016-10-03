import Relation from './relation';

export default class BelongsToRelation extends Relation {

  inverseWillChange() {
    this.withPropertyChange(changed => {
      this.setValue(null, changed);
    }, true);
  }

  inverseDidChange(internal, local) {
    this.withPropertyChange(changed => {
      this.setValue(internal, changed, local);
    }, true);
  }

  //

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

  onDeleted() {
    let inverse = this.getInverseRelation(this.value);
    if(inverse) {
      inverse.inverseDidChange(null, true);
    }
  }

  //

  getValue() {
    let internal = this.value;
    if(!internal) {
      return null;
    }
    return internal.getModel();
  }

  setValue(value, changed, local) {
    if(this.isSettingValue) {
      return;
    }

    this.isSettingValue = true;

    let internal = this.toInternalModel(value);
    if(this.value !== internal) {

      if(!local) {
        this.willSetValue();
      }

      this.value = internal;
      changed();

      if(!local) {
        this.didSetValue();
      }

    }

    this.isSettingValue = false;

    return value || null;
  }

}

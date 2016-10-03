import Relation from './relation';

export default class BelongsToRelation extends Relation {

  inverseWillChange() {
    this.withPropertyChange(changed => {
      this.setValue(null, changed);
    }, true);
  }

  inverseDidChange(internal) {
    this.withPropertyChange(changed => {
      this.setValue(internal, changed);
    }, true);
  }

  //

  willSetValue() {
    let value = this.value;
    if(!value) {
      return;
    }

    value.removeObserver(this);

    let inverse = this.getInverseRelation(value);
    if(inverse) {
      inverse.inverseWillChange(this.internal);
    }
  }

  didSetValue() {
    let value = this.value;
    if(!value) {
      return;
    }

    value.addObserver(this);

    let inverse = this.getInverseRelation(value);
    if(inverse) {
      inverse.inverseDidChange(this.internal);
    }
  }

  //

  onValueDeleted() {
    this.withPropertyChange(changed => {
      let value = this.value;
      value.removeObserver(this);
      this.value = null;
      changed();
    });
  }

  internalModelDidChange(internal, props) {
    if(internal.state.isDeleted && props.includes('isDeleted')) {
      this.onValueDeleted();
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

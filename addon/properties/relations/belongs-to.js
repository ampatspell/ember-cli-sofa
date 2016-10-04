import Ember from 'ember';
import Relation from './relation';

const {
  assert
} = Ember;

export default class BelongsToRelation extends Relation {

  withPropertyChange(cb) {
    let internal = this.internal;
    let relationship = this.relationship;
    internal.withPropertyChanges(changed_ => {
      let changed = () => {
        relationship.dirty(internal, changed_);
        changed_(relationship.name);
      };
      cb(changed);
    }, true);
  }

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
    assert(`internalModelDidChange internal must be this.value`, internal === this.value);
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
      changed(); // TODO: shouldn't this be called with property name?
      this.didSetValue();
    }

    this.isSettingValue = false;

    return value || null;
  }

}

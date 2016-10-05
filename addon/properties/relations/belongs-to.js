import Ember from 'ember';
import Relation from './relation';
import { internalModelDidChangeIsDeleted } from '../../internal-model';

const {
  assert
} = Ember;

export default class BelongsToRelation extends Relation {

  notifyPropertyChange(changed) {
    this.relationship.dirty(this.internal, changed);
    changed(this.relationship.name);
  }

  withPropertyChanges(cb) {
    this.internal.withPropertyChanges(cb, true);
  }

  inverseWillChange() {
    this.withPropertyChanges(changed => {
      this.setValue(null, changed);
    }, true);
  }

  inverseDidChange(internal) {
    this.withPropertyChanges(changed => {
      this.setValue(internal, changed);
    }, true);
  }

  inverseDeleted() {
    this.withPropertyChanges(changed => {
      this.setValue(null, changed);
    });
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
    this.withPropertyChanges(changed => {
      let value = this.value;
      value.removeObserver(this);
      this.value = null;
      this.notifyPropertyChange(changed);
    });
  }

  internalModelDidChange(internal, props) {
    assert(`internalModelDidChange internal must be this.value`, internal === this.value);
    if(internalModelDidChangeIsDeleted(internal, props)) {
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
      this.notifyPropertyChange(changed);
      this.didSetValue();
    }

    this.isSettingValue = false;

    return value || null;
  }

}

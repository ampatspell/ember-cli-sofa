import Ember from 'ember';
import Relation from './relation';
import Error from '../../util/error';
import { getInternalModel } from '../../internal-model';

const {
  getOwner
} = Ember;

class ArrayWrapper {
  constructor(array, fn) {
    this.array = array;
    this.fn = fn;
  }

  addObject(internal) {
    this.array.addObject(this.fn(internal));
  }

  removeObject(internal) {
    this.array.removeObject(this.fn(internal));
  }
}

export default class HasManyRelation extends Relation {

  dirty() {
    let internal = this.internal;
    let relationship = this.relationship;
    internal.withPropertyChanges(changed => {
      relationship.dirty(internal, changed);
    }, true);
  }

  inverseWillChange(internal) {
    if(this.isValueChanging) {
      return;
    }
    this.getWrappedContent().removeObject(internal);
  }

  inverseDidChange(internal) {
    if(this.isValueChanging) {
      return;
    }
    this.getWrappedContent().addObject(internal);
  }

  getWrappedContent() {
    let value = this.value;
    if(value) {
      return new ArrayWrapper(value, internal => internal.getModel());
    }
    let content = this.getContent();
    return new ArrayWrapper(content, internal => internal);
  }

  getContent() {
    let content = this.content;
    if(!content) {
      content = Ember.A();
      this.content = content;
    }
    return content;
  }

  getValue() {
    let value = this.value;
    if(!value) {
      let content = this.getContent();
      let owner = getOwner(this.relationship.store);
      value = this.createArrayProxy(owner, content);
      value.addEnumerableObserver(this, {
        willChange: this.valueWillChange,
        didChange: this.valueDidChange
      });
      this.value = value;
    }
    return value;
  }

  setValue(/*value, changed*/) {
    throw new Error({ error: 'invalid_state', reason: `Please don't replace hasMany relationship content` });
  }

  willRemoveInternalModel(internal) {
    let inverse = this.getInverseRelation(internal);
    if(inverse) {
      inverse.inverseWillChange(this.internal);
    }
  }

  didAddInternalModel(internal) {
    let inverse = this.getInverseRelation(internal);
    if(inverse) {
      inverse.inverseDidChange(this.internal);
    }
  }

  valueWillChange(proxy, removing) {
    this.isValueChanging = true;
    removing.forEach(model => {
      let internal = getInternalModel(model);
      this.willRemoveInternalModel(internal);
    });
  }

  valueDidChange(proxy, removeCount, adding) {
    adding.forEach(model => {
      let internal = getInternalModel(model);
      this.didAddInternalModel(internal);
    });
    this.isValueChanging = false;
    this.dirty();
  }

}

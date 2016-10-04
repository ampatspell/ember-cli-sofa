import Ember from 'ember';
import Relation from './relation';
import assert from '../../util/assert';
import { getInternalModel } from '../../internal-model';

const {
  getOwner
} = Ember;

class ArrayWrapper {

  constructor(array, fn, name) {
    this.array = array;
    this.fn = fn;
    this.name = name;
  }

  _array(array) {
    return Ember.A(array).map(model => {
      return this.fn(model);
    });
  }

  addObjects(array) {
    this.array.addObjects(this._array(array));
  }

  replaceObjects(array) {
    let curr = this.array;
    let next = this._array(array);

    let remove = curr.filter(item => {
      return !next.includes(item);
    });

    let add = next.filter(model => {
      return !curr.includes(model);
    });

    curr.removeObjects(remove);
    curr.pushObjects(add);
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
      return new ArrayWrapper(value, internal => internal.getModel(), 'proxy');
    }
    let content = this.getContent();
    return new ArrayWrapper(content, internal => internal, 'internal');
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

  setValue(value, changed) {
    let internal = Ember.A(value).map(model => getInternalModel(model));
    if(internal.length > 0) {
      this.getWrappedContent().replaceObjects(internal);

      // TODO: needs inverse updates when there is no proxy

      // if proxy is alive, valueWillChange and valueDidChange will update inverses
      // otherwise needs to be done manually
      // isn't this forcing unnecessary model creation?

      // TODO: not sure about `changed` apart from dirty()
      // changed();
    }
    // Not returning anything
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

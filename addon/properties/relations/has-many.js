import Ember from 'ember';
import Relation from './relation';
import { getInternalModel, internalModelDidChangeIsDeleted } from '../../internal-model';

const {
  getOwner,
  assert
} = Ember;

const getDiff = (curr, next) => {
  let remove = curr.filter(item => {
    return !next.includes(item);
  });

  let add = next.filter(model => {
    return !curr.includes(model);
  });

  return { remove, add };
};

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

  addObject(internal) {
    this.array.addObject(this.fn(internal));
  }

  removeObject(internal) {
    this.array.removeObject(this.fn(internal));
  }

}

export default class HasManyRelation extends Relation {

  constructor(relationship, internal) {
    super(...arguments);
    internal.addObserver(this);
  }

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

  willRemoveInternalModel(internal) {
    internal.removeObserver(this);
    let inverse = this.getInverseRelation(internal);
    if(inverse) {
      inverse.inverseWillChange(this.internal);
    }
  }

  didAddInternalModel(internal) {
    internal.addObserver(this);
    let inverse = this.getInverseRelation(internal);
    if(inverse) {
      inverse.inverseDidChange(this.internal);
    }
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

  setValue(value /*, changed*/) {
    let next = Ember.A(value).map(model => getInternalModel(model));
    if(next.length > 0) {
      this.ignoreValueChanges = true;

      let curr = this.getContent();

      let { remove, add } = getDiff(curr, next);

      remove.forEach(internal => {
        this.willRemoveInternalModel(internal);
      });

      curr.removeObjects(remove);
      curr.pushObjects(add);

      add.forEach(internal => {
        this.didAddInternalModel(internal);
      });

      this.ignoreValueChanges = false;

      // TODO: not sure about `changed` apart from dirty()
      // changed();
    }
    // Not returning anything
  }

  valueWillChange(proxy, removing) {
    if(this.ignoreValueChanges) {
      return;
    }
    this.isValueChanging = true;
    removing.forEach(model => {
      let internal = getInternalModel(model);
      this.willRemoveInternalModel(internal);
    });
  }

  valueDidChange(proxy, removeCount, adding) {
    if(this.ignoreValueChanges) {
      return;
    }
    adding.forEach(model => {
      let internal = getInternalModel(model);
      this.didAddInternalModel(internal);
    });
    this.isValueChanging = false;
    this.dirty();
  }

  onContentInternalModelDeleted(internal) {
    this.ignoreValueChanges = true;
    this.getWrappedContent().removeObject(internal);
    this.ignoreValueChanges = false;
  }

  onInternalModelDeleted(internal) {
    this.isValueChanging = true;
    this.getContent().forEach(contentInternal => {
      let inverse = this.getInverseRelation(contentInternal);
      if(inverse) {
        inverse.inverseDeleted(internal);
      }
    });
    this.isValueChanging = false;
  }

  internalModelDidChange(internal, props) {
    if(internal === this.internal) {
      if(internalModelDidChangeIsDeleted(internal, props)) {
        this.onInternalModelDeleted(internal);
      }
    } else {
      assert(`internalModelDidChange content must include internal`, this.getContent().includes(internal));
      if(internalModelDidChangeIsDeleted(internal, props)) {
        this.onContentInternalModelDeleted(internal);
      }
    }
  }

}

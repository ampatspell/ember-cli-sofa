import Ember from 'ember';
import Relation from './relation';
import { getInternalModel, internalModelDidChangeIsDeleted, internalModelDidChangeWillDestroy } from '../../internal-model';

const {
  getOwner,
  assert,
  copy
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
    this.getContent().removeObject(internal);
    internal.removeObserver(this);
    this.dirty();
  }

  inverseDidChange(internal) {
    if(this.isValueChanging) {
      return;
    }
    internal.addObserver(this);
    this.getContent().addObject(internal);
    this.dirty();
  }

  inverseDeleted(internal) {
    this.ignoreValueChanges = true;
    this.getContent().removeObject(internal);
    internal.removeObserver(this);
    this.dirty();
    this.ignoreValueChanges = false;
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

  setValue(value) {
    this.ignoreValueChanges = true;

    let curr = this.getContent();
    let next = Ember.A(value).map(model => getInternalModel(model));

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

  onInternalDeleted() {
    let internal = this.internal;
    this.isValueChanging = true;
    this.getContent().forEach(contentInternal => {
      let inverse = this.getInverseRelation(contentInternal);
      if(inverse) {
        inverse.inverseDeleted(internal);
      }
    });
    this.isValueChanging = false;
  }

  onContentDeleted(internal) {
    this.ignoreValueChanges = true;
    this.getContent().removeObject(internal);
    this.ignoreValueChanges = false;
  }

  onInternalDestroyed() {
    let internal = this.internal;
    console.log('hasMany', this.relationship.name, 'this.internal willDestroy', internal.docId);
  }

  onContentDestroyed(internal) {
    console.log('hasMany', this.relationship.name, 'this.content object willDestroy', internal.docId);
  }

  internalModelDidChange(internal, props) {
    if(internal === this.internal) {
      if(internalModelDidChangeIsDeleted(internal, props)) {
        this.onInternalDeleted();
      } else if(internalModelDidChangeWillDestroy(internal, props)) {
        this.onInternalDestroyed();
      }
    } else {
      assert(`internalModelDidChange content must include internal`, this.getContent().includes(internal));
      if(internalModelDidChangeIsDeleted(internal, props)) {
        this.onContentDeleted(internal);
      } else if(internalModelDidChangeWillDestroy(internal, props)) {
        this.onContentDestroyed(internal);
      }
    }
  }

  internalModelFromModel(model) {
    if(!model) {
      return null;
    }
    return getInternalModel(model);
  }

  modelFromInternalModel(internal) {
    if(!internal) {
      return null;
    }
    return internal.getModel();
  }

}

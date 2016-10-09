import Ember from 'ember';
import Relation from './relation';
import { getInternalModel, internalModelDidChangeIsDeleted, internalModelDidChangeWillDestroy } from '../../internal-model';

const {
  getOwner,
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
    internal.withPropertyChanges(changed => {
      this.relationship.dirty(internal, changed);
    }, true);
  }

  //

  inverseWillChange(internal) {
    this.removeContentObject(internal, false);
  }

  inverseDidChange(internal) {
    this.addContentObject(internal, false);
  }

  inverseDeleted(internal) {
    this.removeContentObject(internal, false);
  }

  getContent() {
    let content = this.content;
    if(!content) {
      content = Ember.A();
      this.content = content;
    }
    return content;
  }

  //

  willRemoveContentObject(internal, updateInverse=true) {
    internal.removeObserver(this);

    if(updateInverse) {
      let inverse = this.getInverseRelation(internal);
      if(inverse) {
        inverse.inverseWillChange(this.internal);
      }
    }
  }

  didAddContentObject(internal, updateInverse=true) {
    internal.addObserver(this);

    if(updateInverse) {
      let inverse = this.getInverseRelation(internal);
      if(inverse) {
        inverse.inverseDidChange(this.internal);
      }
    }
  }

  addContentObject(internal, updateInverse=true) {
    if(!internal) {
      return;
    }
    this.getContent().addObject(internal);
    this.didAddContentObject(internal, updateInverse);
    this.dirty();
  }

  removeContentObject(internal, updateInverse=true) {
    if(!internal) {
      return;
    }
    this.willRemoveContentObject(internal, updateInverse);
    this.getContent().removeObject(internal);
    this.dirty();
  }

  //

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
      this.willRemoveContentObject(internal, true);
    });

    curr.removeObjects(remove);
    curr.pushObjects(add);

    add.forEach(internal => {
      this.didAddContentObject(internal, true);
    });

    this.ignoreValueChanges = false;
  }

  valueWillChange(proxy, removing) {
    if(this.ignoreValueChanges) {
      return;
    }
    this.ignoreValueChanges = true;
    removing.forEach(model => {
      let internal = getInternalModel(model);
      this.willRemoveContentObject(internal, true);
    });
  }

  valueDidChange(proxy, removeCount, adding) {
    adding.forEach(model => {
      let internal = getInternalModel(model);
      this.didAddContentObject(internal, true);
    });
    this.ignoreValueChanges = false;
    this.dirty();
  }

  //

  onInternalDeleted() {
  }

  onContentDeleted(internal) {
    this.ignoreValueChanges = true;
    {
      this.removeContentObject(internal, false);
    }
    this.ignoreValueChanges = false;
  }

  onInternalDestroyed() {
    this.ignoreValueChanges = true;
    {
      let content = copy(this.getContent());
      content.forEach(internal => this.removeContentObject(internal, false));
    }
    this.ignoreValueChanges = false;
  }

  onContentDestroyed(internal) {
    this.onContentDeleted(internal);
  }

  internalModelDidChange(internal, props) {
    if(internal === this.internal) {
      if(internalModelDidChangeIsDeleted(internal, props)) {
        this.onInternalDeleted();
      } else if(internalModelDidChangeWillDestroy(internal, props)) {
        this.onInternalDestroyed();
      }
    } else {
      if(internalModelDidChangeIsDeleted(internal, props)) {
        this.onContentDeleted(internal);
      } else if(internalModelDidChangeWillDestroy(internal, props)) {
        this.onContentDestroyed(internal);
      }
    }
  }

  //

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

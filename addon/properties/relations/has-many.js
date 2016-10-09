import Ember from 'ember';
import Relation from './relation';
import Ignore from './util/ignore';
import {
  getInternalModel,
  internalModelDidChangeIsDeleted,
  internalModelDidChangeInternalWillDestroy
} from '../../internal-model';

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
    this.ignoreValueChanges = new Ignore();
  }

  dirty() {
    this.withPropertyChanges(changed => {
      super.dirty(changed);
    });
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

    this.ignoreValueChanges.with(() => {
      let content = this.getContent();
      content.addObject(internal);
      this.didAddContentObject(internal, updateInverse);
      this.dirty();
    });
  }

  removeContentObject(internal, updateInverse=true) {
    if(!internal) {
      return;
    }

    this.ignoreValueChanges.with(() => {
      let content = this.getContent();
      this.willRemoveContentObject(internal, updateInverse);
      content.removeObject(internal);
      this.dirty();
    });
  }

  //

  get valueObserverOptions() {
    return {
      willChange: this.valueWillChange,
      didChange: this.valueDidChange
    };
  }

  getValue() {
    let value = this.value;
    if(!value) {
      let content = this.getContent();
      let owner = getOwner(this.relationship.store);
      value = this.createArrayProxy(owner, content);
      value.addEnumerableObserver(this, this.valueObserverOptions);
      this.value = value;
    }
    return value;
  }

  setValue(value) {
    this.ignoreValueChanges.with(() => {
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
    });
  }

  valueWillChange(proxy, removing) {
    if(this.ignoreValueChanges.ignore()) {
      return;
    }
    this.ignoreValueChanges.with(() => {
      removing.forEach(model => {
        let internal = getInternalModel(model);
        this.willRemoveContentObject(internal, true);
      });
    });
  }

  valueDidChange(proxy, removeCount, adding) {
    if(this.ignoreValueChanges.ignore()) {
      return;
    }
    this.ignoreValueChanges.with(() => {
      adding.forEach(model => {
        let internal = getInternalModel(model);
        this.didAddContentObject(internal, true);
      });
      this.dirty();
    });
  }

  //

  onInternalDeleted() {
  }

  onContentDeleted(internal) {
    this.ignoreValueChanges.with(() => {
      this.removeContentObject(internal, false);
    });
  }

  onInternalDestroyed() {
    let value = this.value;
    if(value) {
      value.removeEnumerableObserver(this, this.valueObserverOptions);
      value.destroy();
      this.value = null;
    }

    let content = this.content;
    if(content) {
      this.ignoreValueChanges.with(() => {
        let content_ = copy(content);
        content_.forEach(internal => this.removeContentObject(internal, false));
      });
    }
    this.content = null;

    super.onInternalDestroyed();
  }

  onContentDestroyed(internal) {
    this.onContentDeleted(internal);
  }

  internalModelDidChange(internal, props) {
    if(internal === this.internal) {
      if(internalModelDidChangeIsDeleted(internal, props)) {
        this.onInternalDeleted();
      } else if(internalModelDidChangeInternalWillDestroy(internal, props)) {
        this.onInternalDestroyed();
      }
    } else {
      if(internalModelDidChangeIsDeleted(internal, props)) {
        this.onContentDeleted(internal);
      } else if(internalModelDidChangeInternalWillDestroy(internal, props)) {
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

  //

  valueWillDestroy() {
    this.value = null;
    this.withPropertyChanges(changed => {
      this.propertyDidChange(changed);
    });
  }

}

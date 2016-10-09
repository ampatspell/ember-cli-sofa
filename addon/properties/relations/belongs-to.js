import Relation from './relation';
import { internalModelDidChangeIsDeleted, internalModelDidChangeWillDestroy } from '../../internal-model';

export default class BelongsToRelation extends Relation {

  constructor(relationship, internal) {
    super(...arguments);
    internal.addObserver(this);
  }

  dirty(changed) {
    this.relationship.dirty(this.internal, changed);
  }

  propertyDidChange(changed) {
    changed(this.relationship.name);
  }

  notifyPropertyChange(changed) {
    this.dirty(changed);
    this.propertyDidChange(changed);
  }

  withPropertyChanges(cb) {
    return this.internal.withPropertyChanges(cb, true);
  }

  inverseWillChange() {
    this.withPropertyChanges(changed => {
      this.setContent(null, changed, false);
    });
  }

  inverseDidChange(internal) {
    this.withPropertyChanges(changed => {
      this.setContent(internal, changed, false);
    });
  }

  inverseDeleted() {
    this.withPropertyChanges(changed => {
      this.setContent(null, changed, false);
    });
  }

  //

  onInternalDeleted() {
  }

  onContentDeleted() {
    this.withPropertyChanges(changed => {
      this.setContent(null, changed, false);
    });
  }

  onInternalDestroyed() {
    this.withPropertyChanges(changed => {
      this.setContent(null, changed, false);
    });
    super.onInternalDestroyed();
  }

  onContentDestroyed() {
    this.withPropertyChanges(changed => {
      this.setContent(null, changed, false);
    });
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
        this.onContentDeleted();
      } else if(internalModelDidChangeWillDestroy(internal, props)) {
        this.onContentDestroyed();
      }
    }
  }

  //

  willSetContent(updateInverse=true) {
    let content = this.content;
    if(!content) {
      return;
    }

    content.removeObserver(this);

    if(updateInverse) {
      let inverse = this.getInverseRelation(content);
      if(inverse) {
        inverse.inverseWillChange(this.internal);
      }
    }
  }

  didSetContent(updateInverse=true) {
    let content = this.content;
    if(!content) {
      return;
    }

    content.addObserver(this);

    if(updateInverse) {
      let inverse = this.getInverseRelation(content);
      if(inverse) {
        inverse.inverseDidChange(this.internal);
      }
    }
  }

  getContent() {
    return this.content;
  }

  setContent(internal, changed, updateInverse=true) {
    if(this.content !== internal) {
      this.willSetContent(updateInverse);
      this.content = internal;
      this.notifyPropertyChange(changed);
      this.didSetContent(updateInverse);
    }
  }

  //

  getValue() {
    let internal = this.getContent();
    if(!internal) {
      return null;
    }
    return internal.getModel();
  }

  setValue(value, changed) {
    let internal = this.toInternalModel(value);
    this.setContent(internal, changed, true);
    return this.getValue();
  }

}

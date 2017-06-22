import Relation from './relation';
import {
  internalModelDidChangeIsDeleted,
  internalModelDidChangeInternalWillDestroy,
  internalModelDidChangeModelWillDestroy
} from '../../internal-model';

export default class BelongsToRelation extends Relation {

  notifyPropertyChange(changed) {
    this.dirty(changed);
    this.propertyDidChange(changed);
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

  onContentModelDestroyed() {
    this.withPropertyChanges(changed => {
      this.notifyPropertyChange(changed);
    });
  }

  internalModelDidChange(internal, props) {
    super.internalModelDidChange(...arguments);
    if(internal === this.internal) {
      if(internalModelDidChangeIsDeleted(internal, props)) {
        this.onInternalDeleted();
      } else if(internalModelDidChangeInternalWillDestroy(internal, props)) {
        this.onInternalDestroyed();
      }
    } else {
      if(internalModelDidChangeIsDeleted(internal, props)) {
        this.onContentDeleted();
      } else if(internalModelDidChangeInternalWillDestroy(internal, props)) {
        this.onContentDestroyed();
      } else if(internalModelDidChangeModelWillDestroy(internal, props)) {
        this.onContentModelDestroyed();
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
    let internal = this.content;
    if(!internal) {
      return null;
    }
    return internal.getModel();
  }

  setValue(value, changed) {
    let internal = this.toInternalModel(value);
    this.setContent(internal, changed, true);
  }

}

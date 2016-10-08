import Ember from 'ember';
import Relation from './relation';
import { internalModelDidChangeIsDeleted, internalModelDidChangeWillDestroy } from '../../internal-model';

const {
  assert
} = Ember;

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
      this.setValue(null, changed);
    }, true);
  }

  inverseDidChange(internal) {
    this.withPropertyChanges(changed => {
      this.setValue(internal, changed);
    }, true);
  }

  inverseDeleted(internal) {
    this.withPropertyChanges(changed => {
      this.setValue(null, changed);
    });
  }

  //


  willSetContent() {
    let content = this.content;
    if(!content) {
      return;
    }

    content.removeObserver(this);

    let inverse = this.getInverseRelation(content);
    if(inverse) {
      inverse.inverseWillChange(this.internal);
    }
  }

  didSetContent() {
    let content = this.content;
    if(!content) {
      return;
    }

    content.addObserver(this);

    let inverse = this.getInverseRelation(content);
    if(inverse) {
      inverse.inverseDidChange(this.internal);
    }
  }

  //

  onInternalDeleted() {
    this.withPropertyChanges(changed => {
      let content = this.content;
      content.removeObserver(this);
      this.content = null;
      this.notifyPropertyChange(changed);
    });
  }

  onContentDeleted(internal) {
  }

  onInternalDestroyed() {
    let internal = this.internal;
    console.log('belongs-to', this.relationship.name, 'this.internal willDestroy', internal.docId);
  }

  onContentDestroyed(internal) {
    console.log('belongs-to', this.relationship.name, 'this.content willDestroy', internal.docId);
  }

  internalModelDidChange(internal, props) {
    if(internal === this.internal) {
      if(internalModelDidChangeIsDeleted(internal, props)) {
        this.onInternalDeleted();
      } else if(internalModelDidChangeWillDestroy(internal, props)) {
        this.onInternalDestroyed();
      }
    } else {
      if(internalModelDidChangeWillDestroy(internal, props)) {
        this.onContentDeleted(internal);
      } else if(internalModelDidChangeWillDestroy(internal, props)) {
        this.onContentDestroyed(internal);
      }
    }
  }

  //

  getContent() {
    return this.content;
  }

  setContent(internal, changed) {
    if(this.isSettingContent) {
      return;
    }

    this.isSettingContent = true;

    if(this.content !== internal) {
      this.willSetContent();
      this.content = internal;
      this.notifyPropertyChange(changed);
      this.didSetContent();
    }

    this.isSettingContent = false;
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
    this.setContent(internal, changed);
    return this.getValue();
  }

}

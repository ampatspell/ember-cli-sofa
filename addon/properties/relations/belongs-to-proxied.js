import Ember from 'ember';
import BelongsToRelation from './belongs-to';

const {
  getOwner
} = Ember;

export default class BelongsToProxiedRelation extends BelongsToRelation {

  get notifyPropertyChangeProxyPropertyNames() {
    return [ 'content' ];
  }

  notifyPropertyChange(changed) {
    this.dirty(changed);
    let proxy = this.value;
    if(proxy) {
      this.notifyPropertyChangeProxyPropertyNames.forEach(property => {
        proxy.notifyPropertyChange(property);
      });
    } else {
      this.propertyDidChange(changed);
    }
  }

  getValue() {
    let value = this.value;
    if(!value) {
      let owner = getOwner(this.relationship.store);
      value = this.createObjectProxy(owner);
      this.value = value;
    }
    return value;
  }

  setModel(model) {
    return this.withPropertyChanges(changed => {
      return this.setValue(model, changed);
    });
  }

  onWillGetModel() {
  }

  getModel() {
    let internal = this.content;
    if(!internal) {
      return null;
    }
    this.onWillGetModel();
    return internal.getModel();
  }

  onInternalDestroyed() {
    let value = this.value;
    if(value) {
      value.destroy();
      this.value = null;
    }
    super.onInternalDestroyed();
  }

  onContentModelDestroyed() {
    super.onContentModelDestroyed();
  }

}

import Ember from 'ember';
import BelongsToRelation from './belongs-to';

const {
  getOwner
} = Ember;

export default class BelongsToProxiedRelation extends BelongsToRelation {

  notifyPropertyChange(changed) {
    this.dirty(changed);
    let proxy = this.value;
    if(proxy) {
      proxy.notifyPropertyChange('content');
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

  getModel() {
    let internal = this.content;
    if(!internal) {
      return null;
    }
    return internal.getModel();
  }

}

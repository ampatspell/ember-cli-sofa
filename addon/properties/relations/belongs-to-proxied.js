import BelongsToRelation from './belongs-to';

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
      let store = this.relationship.store;
      value = this.createObjectProxy(store);
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
    let value = this.value;
    if(value) {
      value.destroy();
    }
  }

  valueWillDestroy() {
    this.value = null;
    this.withPropertyChanges(changed => {
      this.propertyDidChange(changed);
    });
  }

}

import BelongsToRelation from './belongs-to';

export default class BelongsToProxiedRelation extends BelongsToRelation {

  get notifyInternalModelDidSetDatabase() {
    return true;
  }

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

  didCreateObjectProxy() {
  }

  willDestroyObjectProxy() {
  }

  getValue() {
    let value = this.value;
    if(!value) {
      let store = this.relationship.store;
      value = this.createObjectProxy(store);
      this.didCreateObjectProxy(value);
      this.value = value;
    }
    return value;
  }

  destroyValue() {
    let value = this.value;
    if(!value) {
      return;
    }
    this.willDestroyObjectProxy(value);
    value.destroy();
    this.value = null;
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
    this.destroyValue();
    super.onInternalDestroyed();
  }

  onContentModelDestroyed() {
    this.destroyValue();
  }

  valueWillDestroy() {
    this.value = null;
    this.withPropertyChanges(changed => {
      this.propertyDidChange(changed);
    });
  }

}

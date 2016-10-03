import Ember from 'ember';
import Relation from './relation';
import Error from '../../util/error';
import { getInternalModel } from '../../internal-model';

const {
  getOwner
} = Ember;

export default class HasManyRelation extends Relation {

  inverseWillChange(internal) {
    if(this.isProxyModelsChanging) {
      return;
    }
    // this wakes up models and proxy. bad
    this.getValue().removeObject(internal.getModel());
  }

  inverseDidChange(internal) {
    if(this.isProxyModelsChanging) {
      return;
    }
    // this wakes up models and proxy. bad
    this.getValue().addObject(internal.getModel());
  }

  getValue() {
    let value = this.value;
    if(!value) {
      value = Ember.A();
      this.value = value;
    }
    let proxy = this.proxy;
    if(!proxy) {
      let owner = getOwner(this.relationship.store);
      proxy = this.createArrayProxy(owner, value);
      proxy.addEnumerableObserver(this, {
        willChange: this.proxyModelsWillChange,
        didChange: this.proxyModelsDidChange
      });
      this.proxy = proxy;
    }
    return proxy;
  }

  setValue(/*value, changed*/) {
    throw new Error({ error: 'invalid_state', reason: `Please don't replace hasMany relationship content` });
  }

  willRemoveInternalModel(internal) {
    let inverse = this.getInverseRelation(internal);
    if(inverse) {
      inverse.inverseWillChange(this.internal);
    }
  }

  didAddInternalModel(internal) {
    let inverse = this.getInverseRelation(internal);
    if(inverse) {
      inverse.inverseDidChange(this.internal);
    }
  }

  proxyModelsWillChange(proxy, removing) {
    this.isProxyModelsChanging = true;
    removing.forEach(model => {
      let internal = getInternalModel(model);
      this.willRemoveInternalModel(internal);
    });
  }

  proxyModelsDidChange(proxy, removeCount, adding) {
    adding.forEach(model => {
      let internal = getInternalModel(model);
      this.didAddInternalModel(internal);
    });
    this.isProxyModelsChanging = false;
  }

}

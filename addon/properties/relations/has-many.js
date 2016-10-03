import Ember from 'ember';
import Relation from './relation';

const {
  getOwner
} = Ember;

export default class HasManyRelation extends Relation {

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
      this.proxy = proxy;
    }
    return proxy;
  }

  setValue(value, changed) {
  }

}

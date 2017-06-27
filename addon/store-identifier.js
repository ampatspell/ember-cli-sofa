import Ember from 'ember';

const {
  getOwner
} = Ember;

export const lookupStoreIdentifier = sender => {
  return getOwner(sender).lookup('sofa:store-identifier').increment();
}

export default Ember.Object.extend({

  value: -1,

  increment() {
    this.incrementProperty('value');
    return this.get('value');
  }

});

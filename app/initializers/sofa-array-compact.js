import Ember from 'ember';

// TODO: For some reason Ember.A in fastboot lacks compact()

let A = Ember.A;

Ember.A = function() {
  var arr = A(...arguments);
  if(typeof arr.compact !== 'function') {
    Object.defineProperty(arr, 'compact', {
      value() {
        return this.filter(value => {
          return value != null;
        });
      }
    });
  }
  return arr;
}

export default {
  name: 'sofa:array-compact',
  initialize() {}
};

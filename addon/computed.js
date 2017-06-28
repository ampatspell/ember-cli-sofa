import Ember from 'ember';

const {
  computed
} = Ember;

export function transient(modelName, id) {
  return computed(function() {
    return this.transient(modelName, id);
  }).readOnly();
}

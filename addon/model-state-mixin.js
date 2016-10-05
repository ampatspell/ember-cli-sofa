import Ember from 'ember';
import { getInternalModel } from './internal-model';

const {
  computed
} = Ember;

const state = (name) => {
  return computed(function() {
    return getInternalModel(this).state[name];
  }).readOnly();
};

const load = (name) => {
  return computed(function() {
    let internal = getInternalModel(this);
    internal.enqueueLazyLoadModelIfNeeded();
    return internal.state[name];
  }).readOnly();
};

const props = [ 'isNew', 'isLoading', 'isLoaded', 'isDirty', 'isSaving', 'isDeleted', 'isError', 'error' ];
const lazy  = [ 'isLoading', 'isLoaded' ];
const hash  = {};

props.forEach(key => {
  if(lazy.indexOf(key) !== -1) {
    hash[key] = load(key);
  } else {
    hash[key] = state(key);
  }
});

hash.state = computed(...props, function() {
  return this.getProperties(...props);
});

export default Ember.Mixin.create(hash);

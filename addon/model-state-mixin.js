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

const props = ['isNew', 'isLoading', 'isLoaded', 'isDirty', 'isSaving', 'isDeleted', 'isError', 'error'];
const hash = {};

props.forEach(key => {
  hash[key] = state(key);
});

hash.state = computed(...props, function() {
  return this.getProperties(...props);
});

export default Ember.Mixin.create(hash);

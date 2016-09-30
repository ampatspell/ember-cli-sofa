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

export default Ember.Mixin.create(hash);

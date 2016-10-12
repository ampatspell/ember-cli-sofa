import Ember from 'ember';

const {
  computed
} = Ember;

const state = () => {
  return computed(function() {
    return this._internal.loader.getState();
  }).readOnly();
};

const stateProperty = (name) => {
  return computed('state', function() {
    return this.get('state')[name];
  }).readOnly();
};

const promise = () => {
  return computed(function() {
    return this._internal.loader.getPromise();
  }).readOnly();
};

export default Ember.Mixin.create({

  state: state(),

  isLoaded:  stateProperty('isLoaded'),
  isLoading: stateProperty('isLoading'),
  isError:   stateProperty('isError'),
  error:     stateProperty('error'),

  promise: promise(),

});

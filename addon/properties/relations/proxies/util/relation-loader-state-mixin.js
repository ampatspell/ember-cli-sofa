import Ember from 'ember';

const {
  computed,
  merge
} = Ember;

const promise = () => {
  return computed(function() {
    return this._relation.loader.getPromise();
  }).readOnly();
};

const state = () => {
  return computed(function() {
    return this._relation.loader.getState();
  }).readOnly();
};

const stateProperty = name => {
  return computed('state', function() {
    return this.get('state')[name];
  }).readOnly();
};

const length = () => {
  return computed(function() {
    this._relation.loader.load(true);
    return this._super();
  });
};

const passive = {

  state: state(),

  isLoading: stateProperty('isLoading'),
  isError:   stateProperty('isError'),
  error:     stateProperty('error')

};

const loadable = merge({

  promise:   promise(),

  isLoaded:  stateProperty('isLoaded'),

  length:    length(),

}, passive);

const PassiveRelationLoaderStateMixin  = Ember.Mixin.create(passive);
const LoadableRelationLoaderStateMixin = Ember.Mixin.create(loadable);

export {
  PassiveRelationLoaderStateMixin,
  LoadableRelationLoaderStateMixin
};

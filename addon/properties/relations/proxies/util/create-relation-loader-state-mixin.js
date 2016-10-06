import Ember from 'ember';

const {
  computed
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

const stateProperty = (name) => {
  return computed('state', function() {
    return this.get('state')[name];
  }).readOnly();
};

export default function({ hasPromise }) {
  let props = [ 'isLoading', 'isError', 'error' ];

  let hash = {
    state: state(),
  };

  if(hasPromise) {
    props.push('isLoaded');
    hash.promise = promise();
  }

  props.forEach(prop => {
    hash[prop] = stateProperty(prop);
  });

  return Ember.Mixin.create(hash);
}

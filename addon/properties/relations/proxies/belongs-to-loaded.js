import Ember from 'ember';

const {
  computed
} = Ember;

const content = () => {
  return computed({
    get() {
      return this._relation.getModel();
    },
    set(key, value) {
      return this._relation.setModel(value);
    }
  });
};

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
}

export default Ember.ObjectProxy.extend({

  _relation: null,

  content: content(),

  promise: promise(),
  state: state(),

  isLoading: stateProperty('isLoading'),
  isLoaded:  stateProperty('isLoaded'),
  isError:   stateProperty('isError'),
  error:     stateProperty('error'),

});

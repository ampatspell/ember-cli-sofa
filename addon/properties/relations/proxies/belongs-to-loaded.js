import Ember from 'ember';

const {
  computed,
  computed: { oneWay }
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
    return this._relation.getLoadPromise();
  }).readOnly();
};

const state = () => {
  return computed(function() {
    return this._relation.getLoadState();
  }).readOnly();
};

export default Ember.ObjectProxy.extend({

  _relation: null,

  content: content(),

  promise: promise(),
  state: state(),

  isLoading: oneWay('state.isLoading'),
  isLoaded:  oneWay('state.isLoaded'),
  isError:   oneWay('state.isError'),
  error:     oneWay('state.error'),

});

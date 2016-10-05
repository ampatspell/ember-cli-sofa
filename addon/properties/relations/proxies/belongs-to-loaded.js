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
    return this._relation.getLoadPromise();
  }).readOnly();
};

export default Ember.ObjectProxy.extend({

  _relation: null,

  promise: promise(),
  content: content(),

});

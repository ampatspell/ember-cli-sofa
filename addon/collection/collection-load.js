import Ember from 'ember';

const {
  computed
} = Ember;

const promise = () => {
  return computed(function() {
    return this._internal.loader.getPromise();
  }).readOnly();
};

export default Ember.Mixin.create({

  promise: promise(),

});

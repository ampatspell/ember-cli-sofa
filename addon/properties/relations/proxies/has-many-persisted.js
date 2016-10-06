import Ember from 'ember';
import createTransform from './util/array-transform-mixin';

const {
  computed,
  computed: { oneWay }
} = Ember;

const Transform = createTransform({
  internal(model) {
    return this._relation.internalModelFromModel(model);
  },
  public(internal) {
    return this._relation.modelFromInternalModel(internal);
  }
});

const state = (prop) => {
  return computed(function() {
    return this._relation.enqueueLazyLoadModelIfNeeded(prop);
  }).readOnly();
};

export default Ember.ArrayProxy.extend(Transform, {

  _relation: null,

  state:     state(),

  isLoading: oneWay('state.isLoading'),
  isError:   oneWay('state.isError'),
  error:     oneWay('state.error'),

});

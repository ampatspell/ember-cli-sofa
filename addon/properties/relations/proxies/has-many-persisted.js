import Ember from 'ember';
import createTransform from './array-transform-mixin';

const {
  get,
  computed
} = Ember;

const Transform = createTransform({
  internal(model) {
    return get(this, '_relation').internalModelFromModel(model);
  },
  public(internal) {
    return get(this, '_relation').modelFromInternalModel(internal);
  }
});

const lazyLoad = (prop) => {
  return computed(function() {
    return this.get('_relation').enqueueLazyLoadModelIfNeeded(prop);
  }).readOnly();
}

export default Ember.ArrayProxy.extend(Transform, {

  _relation: null,

  isLoading: lazyLoad('isLoading'),
  isError:   lazyLoad('isError'),
  error:     lazyLoad('error'),

});

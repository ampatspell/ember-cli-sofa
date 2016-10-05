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

// TODO: clean up this mess
// have relation.state which keeps values
const enqueueLoad = (name) => {
  let key = `_${name}`;
  return computed(key, function() {
    let value = this.get(key);
    this.get('_relation').enqueueLazyLoadModelIfNeeded();
    return value;
  }).readOnly();
}

export default Ember.ArrayProxy.extend(Transform, {

  _relation: null,

  _isLoading: false,
  _isError: false,
  _error: null,

  isLoading: enqueueLoad('isLoading'),
  isError:   enqueueLoad('isError'),
  error:     enqueueLoad('error'),

});

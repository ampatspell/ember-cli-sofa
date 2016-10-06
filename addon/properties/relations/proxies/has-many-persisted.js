import Ember from 'ember';
import createTransform from './util/array-transform-mixin';

const {
  computed
} = Ember;

const Transform = createTransform({
  internal(model) {
    return this._relation.internalModelFromModel(model);
  },
  public(internal) {
    return this._relation.modelFromInternalModel(internal);
  }
});

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

export default Ember.ArrayProxy.extend(Transform, {

  _relation: null,

  state:     state(),

  isLoading: stateProperty('isLoading'),
  isError:   stateProperty('isError'),
  error:     stateProperty('error')

});

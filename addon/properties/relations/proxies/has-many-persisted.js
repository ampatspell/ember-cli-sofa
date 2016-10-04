import Ember from 'ember';
import createTransform from './array-transform-mixin';

const {
  get
} = Ember;

const Transform = createTransform({
  internal(model) {
    return get(this, '_relation').internalModelFromModel(model);
  },
  public(internal) {
    return get(this, '_relation').modelFromInternalModel(internal);
  }
});

export default Ember.ArrayProxy.extend(Transform, {

  _relation: null

});

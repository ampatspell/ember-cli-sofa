import Ember from 'ember';
import createTransform from './array-transform-mixin';
import { getInternalModel } from '../../../internal-model';

const Transform = createTransform({
  internal(model) {
    if(!model) {
      return null;
    }
    return getInternalModel(model);
  },
  public(internal) {
    return internal.getModel();
  }
});

export default Ember.ArrayProxy.extend(Transform, {

  _relation: null,



});

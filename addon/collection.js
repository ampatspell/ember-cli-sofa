import Ember from 'ember';
import createTransform from './util/array-transform-mixin';
import { getInternalModel } from './internal-model';

const {
  computed,
  computed: { alias }
} = Ember;

const Transform = createTransform({
  internal(model) {
    return this._internal.internalModelFromModel(model);
  },
  public(internal) {
    return this._internal.modelFromInternalModel(internal);
  }
});

const models = () => {
  return computed('_internal.models.[]', function() {
    return this._internal.models;
  }).readOnly();
};

const matchToInternalModels = () => {
  return computed('match.[]', function() {
    return Ember.A(this.get('match')).map(model => getInternalModel(model));
  }).readOnly();
};

export default Ember.ArrayProxy.extend(Transform, {

  _internal: null,

  model: null,
  models: models(),

  match: computed('model', 'models.[]', function() {
    let model = this.get('model');
    let models = this.get('models');
    if(!model) {
      return models;
    }
    return models.filterBy('modelName', model);
  }).readOnly(),

  arrangedContent: matchToInternalModels(),

});

import Ember from 'ember';
import createTransform from './util/array-transform-mixin';
import Error from './util/error';
import { getInternalModel } from './internal-model';

const {
  computed
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
    return Ember.A(this._internal.models.map(internal => internal.getModel()));
  }).readOnly();
};

const matchToInternalModels = () => {
  return computed('match.[]', function() {
    return Ember.A(this.get('match')).map(model => getInternalModel(model));
  }).readOnly();
};

const normalizedModelName = () => {
  return computed('modelName', function() {
    return this._internal.normalizeModelName(this.get('modelName'));
  }).readOnly();
};

const match = () => {
  return computed('normalizedModelName', 'models.[]', function() {
    let modelName = this.get('normalizedModelName');
    let models = this.get('models');
    if(!modelName) {
      return models;
    }
    return models.filterBy('modelName', modelName);
  }).readOnly();
};

const Collection = Ember.ArrayProxy.extend(Transform, {

  _internal: null,
  arrangedContent: matchToInternalModels(),

  models: models(),

  modelName: null,
  normalizedModelName: normalizedModelName(),

  match: match(),

});

Collection.reopenClass({

  modelName: null,

  _create: Collection.create,

  create() {
    throw new Error({
      error: 'internal',
      reason: 'use `database.collection` to create new collections'
    });
  }

});

export default Collection;

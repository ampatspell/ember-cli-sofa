import Ember from 'ember';
import createTransform from './util/array-transform-mixin';
import Error from './util/error';
import { getInternalModel } from './internal-model';

const {
  computed,
  computed: { oneWay }
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
  return computed('_internal.internalModels.[]', 'normalizedModelName', function() {
    let modelName = this.get('normalizedModelName');
    let models = Ember.A(this._internal.internalModels);
    if(modelName) {
      models = Ember.A(models.filter(internal => internal.modelName === modelName));
    }
    return Ember.A(models.map(internal => internal.getModel()));
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

const database = () => {
  return computed(function() {
    return this._internal.database;
  }).readOnly();
};

const Collection = Ember.ArrayProxy.extend(Transform, {

  _internal: null,

  database: database(),
  models: models(),

  modelName: null,
  normalizedModelName: normalizedModelName(),

  match: oneWay('models').readOnly(),

  arrangedContent: matchToInternalModels(),

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

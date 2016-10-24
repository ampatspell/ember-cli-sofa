import Ember from 'ember';
import { getInternalModel } from '../internal-model';

const {
  get,
  computed,
  computed: { oneWay },
  A
} = Ember;

const models = () => {
  return computed('_internal.internalModels.[]', 'modelClass', function() {
    let modelClass = this.get('modelClass');
    let models = A(this._internal.internalModels);
    if(modelClass) {
      models = A(models.filter(internal => internal.definition.is(modelClass)));
    }
    return A(models.map(internal => internal.getModel()));
  }).readOnly();
};

const matchToInternalModels = () => {
  return computed('match.[]', function() {
    return A(this.get('match')).map(model => getInternalModel(model));
  }).readOnly();
};

const modelClass = () => {
  return computed('modelName', function() {
    return this._internal.modelClassForName(this.get('modelName'));
  }).readOnly();
};

const normalizedModelName = () => {
  return computed('modelClass', function() {
    let modelClass = this.get('modelClass');
    if(!modelClass) {
      return;
    }
    return get(modelClass, 'modelName');
  }).readOnly();
};

const database = () => {
  return computed(function() {
    return this._internal.database;
  }).readOnly();
};

export default Ember.Mixin.create({

  database: database(),
  models: models(),

  modelName: null,
  modelClass: modelClass(),
  normalizedModelName: normalizedModelName(),

  match: oneWay('models').readOnly(),

  arrangedContent: matchToInternalModels(),

});

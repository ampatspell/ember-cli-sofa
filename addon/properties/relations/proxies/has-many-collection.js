import Ember from 'ember';
import Transform from './util/internal-model-to-model-transform';
import ValueWillDestroyMixin from './util/value-will-destroy-mixin';
import { LoadableRelationLoaderStateMixin } from './util/relation-loader-state-mixin';
import PropertiesForQueryMixin from './util/properties-for-query-mixin';
import { getInternalModel } from '../../../internal-model';

const {
  get,
  computed,
  computed: { reads },
  A
} = Ember;

const models = () => {
  return computed('_relation.internalModels.[]', function() {
    let relation = this._relation;
    let modelClass = relation.relationshipModelClass;
    let allModels = A(relation.internalModels);
    let withClass = A(allModels.filter(internal => internal.definition.is(modelClass)));
    return A(withClass.map(internal => internal.getModel()));
  }).readOnly();
};

const database = () => {
  return computed(function() {
    return this._relation.database;
  }).readOnly();
};

export default Ember.ArrayProxy.extend(
  LoadableRelationLoaderStateMixin,
  ValueWillDestroyMixin,
  PropertiesForQueryMixin, {

  _relation: null,

  database: database(),
  models: models(),

  content: reads('models'),

});

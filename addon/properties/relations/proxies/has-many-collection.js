import Ember from 'ember';
import ValueWillDestroyMixin from './util/value-will-destroy-mixin';
import { LoadableRelationLoaderStateMixin } from './util/relation-loader-state-mixin';
import PropertiesForQueryMixin from './util/properties-for-query-mixin';

const {
  computed,
  computed: { reads },
  A
} = Ember;

const models = () => {
  return computed('_relation.internalModels.[]', function() {
    let relation = this._relation;
    let modelClass = relation.relationshipModelClass;
    let allModels = A(relation.internalModels);
    let filtered;
    if(modelClass) {
      filtered = A(allModels.filter(internal => internal.definition.is(modelClass)));
    } else {
      filtered = allModels;
    }
    return A(filtered.map(internal => internal.getModel()));
  }).readOnly();
};

const matches = () => {
  return reads('models');
};

const content = () => {
  return reads('matches').readOnly();
};

export default Ember.ArrayProxy.extend(
  LoadableRelationLoaderStateMixin,
  ValueWillDestroyMixin,
  PropertiesForQueryMixin, {

  _relation: null,

  models: models(),

  matches: matches(),
  content: content()

});

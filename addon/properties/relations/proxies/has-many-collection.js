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
    let withClass = A(allModels.filter(internal => internal.definition.is(modelClass)));
    return A(withClass.map(internal => internal.getModel()));
  }).readOnly();
};

const content = () => {
  return reads('models');
};

export default Ember.ArrayProxy.extend(
  LoadableRelationLoaderStateMixin,
  ValueWillDestroyMixin,
  PropertiesForQueryMixin, {

  _relation: null,

  models: models(),
  content: content()

});

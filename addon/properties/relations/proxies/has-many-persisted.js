import Ember from 'ember';
import Transform from './util/internal-model-to-model-transform';
import ValueWillDestroyMixin from './util/value-will-destroy-mixin';
import { PassiveRelationLoaderStateMixin } from './util/relation-loader-state-mixin';
import PropertiesForQueryMixin from './util/properties-for-query-mixin';

export default Ember.ArrayProxy.extend(
  Transform,
  PassiveRelationLoaderStateMixin,
  ValueWillDestroyMixin,
  PropertiesForQueryMixin, {

  _relation: null

});

import Ember from 'ember';
import Transform from './util/internal-model-to-model-transform';
import ValueWillDestroyMixin from './util/value-will-destroy-mixin';
import { LoadableRelationLoaderStateMixin } from './util/relation-loader-state-mixin';
import ContextPropertiesMixin from './util/context-properties-mixin';

export default Ember.ArrayProxy.extend(
  Transform,
  LoadableRelationLoaderStateMixin,
  ValueWillDestroyMixin,
  ContextPropertiesMixin, {

  _relation: null,

  query: null

});

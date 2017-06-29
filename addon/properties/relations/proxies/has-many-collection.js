import Ember from 'ember';
import ValueWillDestroyMixin from './util/value-will-destroy-mixin';
import { LoadableRelationLoaderStateMixin } from './util/relation-loader-state-mixin';
import ContextPropertiesMixin from './util/context-properties-mixin';
import CollectionModelsMixin from './util/collection-models-mixin';

const {
  computed: { reads },
} = Ember;

export const matches = () => {
  return reads('models');
};

const content = () => {
  return reads('matches').readOnly();
};


export default Ember.ArrayProxy.extend(
  LoadableRelationLoaderStateMixin,
  ValueWillDestroyMixin,
  ContextPropertiesMixin,
  CollectionModelsMixin, {

  _relation: null,

  query: null,

  matches: matches(),
  content: content(),

});

import Ember from 'ember';
import { LoadableRelationLoaderStateMixin } from './util/relation-loader-state-mixin';
import ValueWillDestroyMixin from './util/value-will-destroy-mixin';
import ContextPropertiesMixin from './util/context-properties-mixin';
import CollectionModelsMixin from './util/collection-models-mixin';

const {
  computed
} = Ember;

const matches = () => {
  return Ember.computed('models.[]', function() {
    return this.get('models').objectAt(0);
  });
}

const content = () => {
  return computed('matches', function() {
    // this._relation.loader.load();
    return this.get('matches') || null;
  }).readOnly();
}

export default Ember.ObjectProxy.extend(
  LoadableRelationLoaderStateMixin,
  ValueWillDestroyMixin,
  ContextPropertiesMixin,
  CollectionModelsMixin, {

  _relation: null,

  query: null,

  matches: matches(),
  content: content(),

});

import Ember from 'ember';
import { LoadableRelationLoaderStateMixin } from './util/relation-loader-state-mixin';
import ValueWillDestroyMixin from './util/value-will-destroy-mixin';
import ContextPropertiesMixin from './util/context-properties-mixin';
import CollectionModelsMixin from './util/collection-models-mixin';
import InitializedMixin from './util/initialized-mixin';

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
    if(this._isProxyInitialized) {
      this._relation.loader.load(true);
    }
    return this.get('matches') || null;
  }).readOnly();
}

export default Ember.ObjectProxy.extend(
  InitializedMixin,
  LoadableRelationLoaderStateMixin,
  ValueWillDestroyMixin,
  ContextPropertiesMixin,
  CollectionModelsMixin, {

  _relation: null,

  query: null,

  matches: matches(),
  content: content()

});

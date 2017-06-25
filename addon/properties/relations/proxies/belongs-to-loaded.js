import Ember from 'ember';
import { LoadableRelationLoaderStateMixin } from './util/relation-loader-state-mixin';
import ValueWillDestroyMixin from './util/value-will-destroy-mixin';
import PropertiesForQueryMixin from './util/properties-for-query-mixin';

const {
  computed
} = Ember;

const content = () => {
  return computed({
    get() {
      return this._relation.getModel();
    },
    set(key, value) {
      return this._relation.setModel(value);
    }
  });
};

export default Ember.ObjectProxy.extend(
  LoadableRelationLoaderStateMixin,
  ValueWillDestroyMixin,
  PropertiesForQueryMixin, {

  _relation: null,

  query: null,

  content: content()

});

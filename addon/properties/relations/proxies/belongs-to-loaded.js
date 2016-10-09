import Ember from 'ember';
import { LoadableRelationLoaderStateMixin } from './util/relation-loader-state-mixin';
import ValueWillDestroyMixin from './util/value-will-destroy-mixin';

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

export default Ember.ObjectProxy.extend(LoadableRelationLoaderStateMixin, ValueWillDestroyMixin, {

  _relation: null,

  content: content()

});

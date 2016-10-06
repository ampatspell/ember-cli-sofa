import Ember from 'ember';
import createRelationLoaderStateMixin from './util/create-relation-loader-state-mixin';

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

const RelationLoaderState = createRelationLoaderStateMixin({ hasPromise: true });

export default Ember.ObjectProxy.extend(RelationLoaderState, {

  _relation: null,

  content: content()

});

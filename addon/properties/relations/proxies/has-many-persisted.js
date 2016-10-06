import Ember from 'ember';
import Transform from './util/internal-model-to-model-transform';
import createRelationLoaderStateMixin from './util/create-relation-loader-state-mixin';

let RelationLoaderState = createRelationLoaderStateMixin({ hasPromise: false });

export default Ember.ArrayProxy.extend(Transform, RelationLoaderState, {

  _relation: null

});

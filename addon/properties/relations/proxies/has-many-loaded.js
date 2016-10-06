import Ember from 'ember';
import Transform from './util/internal-model-to-model-transform';
import { LoadableRelationLoaderStateMixin } from './util/relation-loader-state-mixin';

export default Ember.ArrayProxy.extend(Transform, LoadableRelationLoaderStateMixin, {

  _relation: null,

});

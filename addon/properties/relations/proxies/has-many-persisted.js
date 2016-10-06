import Ember from 'ember';
import Transform from './util/internal-model-to-model-transform';
import { PassiveRelationLoaderStateMixin } from './util/relation-loader-state-mixin';

export default Ember.ArrayProxy.extend(Transform, PassiveRelationLoaderStateMixin, {

  _relation: null

});

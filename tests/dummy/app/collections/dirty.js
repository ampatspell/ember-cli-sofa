import Ember from 'ember';
import { Collection } from 'sofa';

const {
  computed
} = Ember;

export default Collection.extend({

  modelName: null,

  match: computed('models.@each.isDirty', function() {
    return this.get('models').filterBy('isDirty');
  }).readOnly(),

});

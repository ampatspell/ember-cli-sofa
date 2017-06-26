import Ember from 'ember';
import { Relationship } from 'sofa';

const {
  computed
} = Ember;

export default Relationship.extend({

  matches: computed('models.@each.isDirty', function() {
    return this.get('models').filterBy('isDirty', true);
  }).readOnly(),

  excludingRoot: computed('@each.modelName', function() {
    return this.filter(model => model.get('modelName') !== 'dummy-root');
  }).readOnly(),

});

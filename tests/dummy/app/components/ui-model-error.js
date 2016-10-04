import Ember from 'ember';

const {
  computed: { oneWay }
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [':ui-model-error'],

  error: oneWay('model.error'),

});

import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [':ui-json'],

  string: computed('value', function() {
    return JSON.stringify(this.get('value'), null, '  ');
  })
});

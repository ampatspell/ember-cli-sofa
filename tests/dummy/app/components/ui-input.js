import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [':ui-input'],

  detailedValue: computed('value', function() {
    let value = this.get('value');
    if(value === undefined) {
      return '(undefined)';
    }
    if(value === null) {
      return '(null)';
    }
    if(value === '') {
      return '(blank)';
    }
    if(typeof value === 'number' && isNaN(value)) {
      return '(NaN)';
    }
    return value;
  }),

});

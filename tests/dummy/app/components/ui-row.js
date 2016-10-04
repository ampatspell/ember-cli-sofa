import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [':ui-row'],

  showValue: false,

  detailedValue: computed('value', 'showValue', function() {
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
  })

});

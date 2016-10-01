import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [':ui-input'],
  layout: hbs`
    <div class="title">{{title}} <span class="detail">{{detailedValue}}</span></div>
    <div class="value">{{input value=value}}</div>
  `,

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

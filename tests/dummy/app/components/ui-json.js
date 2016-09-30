import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [':ui-json'],
  layout: hbs`
    <div class="string">{{string}}</div>
  `,

  string: computed('value', function() {
    return JSON.stringify(this.get('value'), null, '  ');
  })
});

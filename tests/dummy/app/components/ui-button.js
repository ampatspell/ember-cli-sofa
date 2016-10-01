import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [':ui-button'],
  layout: hbs`
    <button {{action 'click'}}>{{title}}</button>
  `,

  actions: {
    click() {
      if(this.attrs.action) {
        this.attrs.action();
      }
    }
  }

});

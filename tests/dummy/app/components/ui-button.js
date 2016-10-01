import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: [':ui-button'],

  actions: {
    click() {
      if(this.attrs.action) {
        this.attrs.action();
      }
    }
  }

});

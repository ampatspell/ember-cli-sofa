import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: [':ui-screen'],

  actions: {
    select(author) {
      this.set('author', author);
    },
    close() {
      this.set('author', null);
    }
  }
});

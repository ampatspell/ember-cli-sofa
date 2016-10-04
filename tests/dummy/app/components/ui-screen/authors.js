import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: [':ui-screen', ':authors'],

  actions: {
    selectAuthor(author) {
      this.get('router').transitionTo('authors.author', author);
    },
    createNewAuthor() {
      this.get('router').transitionTo('authors.new');
    }
  }
});

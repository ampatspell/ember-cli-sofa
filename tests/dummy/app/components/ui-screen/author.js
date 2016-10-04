import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: [':ui-screen', ':authors'],

  actions: {
    edit() {
      this.get('router').transitionTo('authors.author.edit', this.get('author'));
    },
    delete() {
      this.get('author').delete().then(() => {
        this.get('router').transitionTo('authors');
      });
    }
  }
});

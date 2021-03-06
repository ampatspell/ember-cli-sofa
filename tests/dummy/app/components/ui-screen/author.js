import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: [':ui-screen', ':authors'],

  actions: {
    loadPost() {
      this.get('author.post').get('promise');
    },
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

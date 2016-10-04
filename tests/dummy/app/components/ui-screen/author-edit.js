import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: [':ui-screen', ':author-edit'],

  actions: {
    saveAuthor(author) {
      author.save().then(() => {
        this.get('router').transitionTo('authors.author', author);
      }, () => undefined);
    }
  }
});

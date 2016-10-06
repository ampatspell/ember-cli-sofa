import Ember from 'ember';

const {
  RSVP: { all }
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [':ui-screen', ':author-edit'],

  actions: {
    saveAuthor(author) {
      all([
        author.save(),
        all( author.get('blogs').map(blog => blog.save()) )
      ]).then(() => {
        this.get('router').transitionTo('authors.author', author);
      }, () => undefined);
    }
  }
});

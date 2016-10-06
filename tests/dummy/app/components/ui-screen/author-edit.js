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
        all( this.get('store.db.main').dirty('blog').map(blog => blog.save()) )
      ]).then(() => {
        this.get('router').transitionTo('authors.author', author);
      }, () => undefined);
    }
  }
});

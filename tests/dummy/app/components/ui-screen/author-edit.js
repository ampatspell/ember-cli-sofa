import Ember from 'ember';

const {
  RSVP: { all },
  Logger: { error }
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [':ui-screen', ':author-edit'],

  actions: {
    saveAuthor(author) {
      all(this.get('store.dirtyModels.excludingRoot').map(model => model.save())).then(() => {
        this.get('router').transitionTo('authors.author', author);
      }, err => {
        error(err);
      });
    }
  }
});

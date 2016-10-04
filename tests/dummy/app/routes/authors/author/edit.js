import Ember from 'ember';

const {
  RSVP: { hash }
} = Ember;

export default Ember.Route.extend({

  model() {
    return hash({
      author: this.modelFor('authors.author'),
      blogs: this.get('store.db.main').find({ model: 'blog', selector: {} })
    });
  }

});

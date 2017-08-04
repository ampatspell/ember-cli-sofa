import Ember from 'ember';

const {
  RSVP: { hash }
} = Ember;

export default Ember.Route.extend({

  model() {
    return hash({
      author: this.get('store.db.main').model('author', { name: 'unnamed' }),
      blogs: this.get('store.db.main').find({ model: 'blog', ddoc: 'blogs', view: 'all' })
    });
  }

});

import Ember from 'ember';

const {
  RSVP: { hash, all }
} = Ember;

export default Ember.Route.extend({

  model(params) {
    return this.get('store.db.main').find({ model: 'author', id: params.author_id }).then(author => {
      return hash({
        author,
//        blogs: all(author.get('blogs').map(blog => blog.load()))
      });
    }).then(hash => hash.author);
  }

});

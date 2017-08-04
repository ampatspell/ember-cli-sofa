import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    return this.get('store.db.main').find({ model: 'author', ddoc: 'authors', view: 'all' }).then(() => {
      return this.get('store.authors');
    });
  }

});

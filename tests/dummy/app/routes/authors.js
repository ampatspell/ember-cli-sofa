import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    return this.get('store.db.main').find({ model: 'author', selector: {} }).then(() => {
      return this.get('store.authors');
    });
  }

});

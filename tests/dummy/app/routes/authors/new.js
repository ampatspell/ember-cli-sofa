import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    return this.get('store.db.main').model('author', { name: 'unnamed' });
  }

});

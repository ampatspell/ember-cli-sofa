import Ember from 'ember';

export default Ember.Route.extend({

  model(params) {
    return this.get('store.db.main').find({ model: 'author', id: params.author_id });
  }

});

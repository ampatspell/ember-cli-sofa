import Ember from 'ember';

export default Ember.Route.extend({

  model(params) {
    let id = params.author_id;
    return this.get('store.db.main').find({ model: 'author', id });
  }

});

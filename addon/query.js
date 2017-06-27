import Ember from 'ember';

const Query = Ember.Object.extend({
});

Query.reopenClass({

  store: null,
  modelName: null

});

export default Query;

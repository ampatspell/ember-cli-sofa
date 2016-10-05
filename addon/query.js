import Ember from 'ember';
import Error from './util/error';

const Query = Ember.Object.extend({
});

Query.reopenClass({

  store: null,
  modelName: null,

  _create: Query.create,

  create() {
    throw new Error({ error: 'internal', reason: 'do not create Query instances' });
  },

});

export default Query;

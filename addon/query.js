import Ember from 'ember';
import Error from './util/error';

const {
  RSVP: { resolve }
} = Ember;

const Query = Ember.Object.extend({

  _relation: null,

  _find() {
    let opts = this.get('find') || {};

    let relation = this._relation;
    opts.model = relation.relationshipModelName;

    let database = relation.database;
    let fn = relation.isMany ? database._internalModelFind : database._internalModelFirst;

    return fn.call(database, opts);
  }

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

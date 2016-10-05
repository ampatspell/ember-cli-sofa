import Ember from 'ember';
import Error from './util/error';

const {
  computed
} = Ember;

const relation = (prop) => {
  return computed(function() {
    return this._relation[prop];
  }).readOnly();
};

const model = (prop) => {
  return computed(function() {
    // TODO: returns proxy
    // might be nicer to return model itself. then notifyPropertyChange in relation is needed
    return this._relation.getValue();
  }).readOnly();
}

// TODO: Might make sense to extend Query as a RelationQuery (or RelationFindQuery and RelationFirstQuery)
// Then it will be easier to use the same thing as a RootCollection query
//
// store._queryClassForName('random', 'relation-find', initFn)
//

const Query = Ember.Object.extend({

  _relation: null,

  model: model(),
  store: relation('store'),
  database: relation('database'),

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

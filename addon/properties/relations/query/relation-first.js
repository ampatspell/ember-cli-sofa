import Ember from 'ember';

const {
  computed
} = Ember;

const relation = (prop) => {
  return computed(function() {
    return this._relation[prop];
  }).readOnly();
};

const model = () => {
  return computed(function() {
    // TODO: returns proxy
    // might be nicer to return model itself. then notifyPropertyChange in relation is needed
    return this._relation.getValue();
  }).readOnly();
};

export default Ember.Mixin.create({

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

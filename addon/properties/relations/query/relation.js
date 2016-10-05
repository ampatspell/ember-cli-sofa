import Ember from 'ember';

const {
  computed,
  assert
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

  _invokeFind(database, opts) {
    assert(`override _invokeFind and don't call super ${this} ${database} ${opts}`, false);
  },

  _find() {
    let relation = this._relation;
    let database = relation.database;
    let model = relation.relationshipModelName;

    let opts = this.get('find') || {};
    opts.model = model;

    return this._invokeFind(database, opts);
  }

});

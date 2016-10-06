import Ember from 'ember';

const {
  computed,
  assert,
  observer,
  run: { next, cancel }
} = Ember;

const relation = (prop) => {
  return computed(function() {
    return this._relation[prop];
  }).readOnly();
};

const model = () => {
  return computed(function() {
    return this._relation.internal.getModel();
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
  },

  _isLoadable: computed('model.isNew', function() {
    let model = this.get('model');
    if(model.get('isNew')) {
      return false;
    }
    return true;
  }),

  _observePropertyChanges: observer('find', '_isLoadable', function() {
    cancel(this.__propertyChanges);
    if(!this.get('_isLoadable')) {
      return;
    }
    this.__propertyChanges = next(() => {
      this._relation.loader.setNeedsReload();
    });
  }),

});

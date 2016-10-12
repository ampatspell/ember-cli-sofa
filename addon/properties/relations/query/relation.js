import Ember from 'ember';

const {
  computed,
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

  _find() {
    let relation = this._relation;
    let database = relation.relationshipDatabase;
    let model = relation.relationshipModelName;
    return this.__find(database, model);
  },

  _isLoadable: computed('find', 'model.isNew', function() {
    let find = this.get('find');
    if(!find) {
      return false;
    }
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

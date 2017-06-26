import Ember from 'ember';

const {
  computed,
  observer,
  run: { next, cancel },
  merge
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

const isLoadable = opts => {
  let props = [ 'find', 'database' ];
  if(opts.requireSavedModel) {
    props.push('model.isNew');
  }
  return computed(...props, function() {
    let find = this.get('find');
    if(!find) {
      return false;
    }
    let database = this.get('database');
    if(!database) {
      return false;
    }
    if(opts.requireSavedModel) {
      if(this.get('model.isNew')) {
        return false;
      }
    }
    return true;
  }).readOnly();
}

export default opts => {
  opts = merge({ requireSavedModel: true }, opts);

  let _isLoadable = isLoadable(opts);

  return Ember.Mixin.create({

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

    _isLoadable,

    _observePropertyChanges: observer('find', '_isLoadable', function() {
      cancel(this.__propertyChanges);
      if(!this.get('_isLoadable')) {
        return;
      }
      this.__propertyChanges = next(() => {
        this._relation.loader.setNeedsReload();
      });
    }),

    willDestroy() {
      cancel(this.__propertyChanges);
      this._super();
    }

  });
}

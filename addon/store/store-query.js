import Ember from 'ember';

const {
  merge
} = Ember;

export default Ember.Mixin.create({

  _createQueryForName(query, props, variantName, variantFn) {
    let factoryOptions = {};
    return this._queryClassForName(query, factoryOptions, variantName, variantFn)._create(props);
  },

  _buildQueryFactoryOptions(query) {
    if(typeof query === 'string') {
      return {
        name: query
      };
    };
    return query;
  },

  _queryIdentifier(variant, opts) {
    return `${variant} ${JSON.stringify(opts)}`;
  },

  _createQuery(query, props, variant, fn) {
    let opts = merge({}, this._buildQueryFactoryOptions(query));
    let name = opts.name;
    delete opts.name;
    // variant = this._queryIdentifier(variant, opts);
    return this._createQueryForName(name, props, variant, fn);
    // return this._queryClassForName(query.name, variantName, variantFn)._create(props);
  },

  _createQueryForRelation(_relation, variantName, variantFn) {
    let query = _relation.relationship.opts.query;
    if(!query) {
      let relationship = _relation.getValue();
      query = relationship.get('query');
    }
    return this._createQuery(query, { _relation }, variantName, variantFn);
  },

  _createQueryForInternalCollection(_internalCollection, variantName, variantFn) {
    let collection = _internalCollection.getCollectionModel();
    let query = collection.get('queryName');
    if(!query) {
      return;
    }
    return this._createQuery(query, { _internalCollection }, variantName, variantFn);
  }

});

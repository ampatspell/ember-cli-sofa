import Ember from 'ember';

export default Ember.Mixin.create({

  _createQueryForName({ name, factory, variant, props}) {
    return this._queryClassForName({
      name,
      factory,
      variant
    })._create(props);
  },

  // _buildQueryFactoryOptions(query) {
  //   if(typeof query === 'string') {
  //     return {
  //       name: query
  //     };
  //   };
  //   return query;
  // },

  // _queryIdentifier(variant, opts) {
  //   return `${variant} ${JSON.stringify(opts)}`;
  // },

  // _createQuery(query, props, variant, fn) {
  //   let opts = merge({}, this._buildQueryFactoryOptions(query));
  //   let name = opts.name;
  //   delete opts.name;
  //   // variant = this._queryIdentifier(variant, opts);
  //   return this._createQueryForName(name, props, variant, fn);
  //   // return this._queryClassForName(query.name, variantName, variantFn)._create(props);
  // },

  _createQueryForRelation(_relation, variant) {
    let name = _relation.relationship.opts.query;
    if(!name) {
      let relationship = _relation.getValue();
      name = relationship.get('query');
    }
    return this._createQueryForName({
      name,
      variant,
      props: { _relation }
    });
  },

  _createQueryForInternalCollection(_internalCollection, variant) {
    let collection = _internalCollection.getCollectionModel();
    let name = collection.get('query') || collection.get('queryName');
    if(!name) {
      return;
    }
    return this._createQueryForName({
      name,
      variant,
      props: { _internalCollection }
    });
  }

});

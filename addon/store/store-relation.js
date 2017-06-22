import Ember from 'ember';
import {
  __sofa_type__,
  __sofa_relation_proxy_type__
} from './store-constants';

export default Ember.Mixin.create({

  __relationProxyClassForName(proxyName, variant, variantFn) {
    return this._classForName(`sofa:${proxyName}`, 'base', variant, Proxy => {
      let Extended = Proxy.extend();
      Extended.reopenClass({ store: this, [__sofa_type__]: __sofa_relation_proxy_type__ });
      return Extended;
    }, variantFn);
  },

  _relationshipMixinBuilderForName(name) {
    if(!name) {
      return;
    }
    return this._classForName('relationship', name);
  },

  _buildRelationshipMixin(relation) {
    let variant = relation.relationship.opts.relationship;
    let builder = this._relationshipMixinBuilderForName(variant);
    let Mixin;
    if(builder) {
      Mixin = builder.build();
    }
    return {
      variant,
      Mixin
    };
  },

  _relationProxyClassForName(_relation, proxyName) {
    let { variant, Mixin } = this._buildRelationshipMixin(_relation);
    return this.__relationProxyClassForName(proxyName, variant, Proxy => Proxy.reopen(Mixin));
  },

  _createBelongsToLoadedProxyForRelation(_relation) {
    return this._relationProxyClassForName(_relation, 'belongs-to-loaded').create({ _relation });
  },

  _createHasManyLoadedProxyForRelation(_relation, content) {
    return this._relationProxyClassForName(_relation, 'has-many-loaded').create({ _relation, content });
  },

  _createHasManyPersistedProxyForRelation(_relation, content) {
    return this._relationProxyClassForName(_relation, 'has-many-persisted').create({ _relation, content });
  }

});

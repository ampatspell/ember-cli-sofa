import Ember from 'ember';
import {
  __sofa_type__,
  __sofa_relation_proxy_type__
} from './store-constants';

export default Ember.Mixin.create({

  __relationProxyClassForName(proxyName, variant) {
    return this._classForName({
      prefix: `sofa:${proxyName}`,
      name: 'base',
      prepare: Proxy => {
        let Extended = Proxy.extend();
        Extended.reopenClass({ store: this, [__sofa_type__]: __sofa_relation_proxy_type__ });
        return Extended;
      },
      variant,
    });
  },

  _relationshipBuilderForName(name) {
    if(!name) {
      return;
    }
    return this._classForName({ prefix: 'relationship', name, augment: false });
  },

  _buildRelationshipVariantOptions(relation) {
    let name = relation.relationship.opts.relationship;
    let builder = this._relationshipBuilderForName(name);
    let prepare;
    if(builder) {
      prepare = Proxy => builder.build(Proxy);
    } else {
      prepare = Proxy => Proxy;
    }
    return { name, prepare };
  },

  _relationshipBuilderForNameHasProperty(relationshipName, name) {
    let builder = this._relationshipBuilderForName(relationshipName);
    if(!builder) {
      return false;
    }
    return builder.hasInheritedProperty(name);
  },

  _relationProxyClassForName(_relation, proxyName) {
    let variant = this._buildRelationshipVariantOptions(_relation);
    return this.__relationProxyClassForName(proxyName, variant);
  },

  _createBelongsToLoadedProxyForRelation(_relation) {
    return this._relationProxyClassForName(_relation, 'belongs-to-loaded').create({ _relation });
  },

  _createHasManyLoadedProxyForRelation(_relation, content) {
    return this._relationProxyClassForName(_relation, 'has-many-loaded').create({ _relation, content });
  },

  _createHasManyPersistedProxyForRelation(_relation, content) {
    return this._relationProxyClassForName(_relation, 'has-many-persisted').create({ _relation, content });
  },

  _createHasManyCollectionProxyForRelation(_relation) {
    return this._relationProxyClassForName(_relation, 'has-many-collection').create({ _relation });
  }

});

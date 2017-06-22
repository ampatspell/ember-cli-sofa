import Ember from 'ember';
import {
  __sofa_type__,
  __sofa_relation_proxy_type__
} from './store-constants';

export default Ember.Mixin.create({

  _relationProxyClassForName(proxyName, variant) {
    return this._classForName(`sofa:${proxyName}`, 'base', variant, Proxy => {
      let Extended = Proxy.extend();
      Extended.reopenClass({ store: this, [__sofa_type__]: __sofa_relation_proxy_type__ });
      return Extended;
    });
  },

  _createBelongsToLoadedProxyForRelation(_relation) {
    return this._relationProxyClassForName('belongs-to-loaded').create({ _relation });
  },

  _createHasManyLoadedProxyForRelation(_relation, content) {
    return this._relationProxyClassForName('has-many-loaded').create({ _relation, content });
  },

  _createHasManyPersistedProxyForRelation(_relation, content) {
    return this._relationProxyClassForName('has-many-persisted').create({ _relation, content });
  }

});

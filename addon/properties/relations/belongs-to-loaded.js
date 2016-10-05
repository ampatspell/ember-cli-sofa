import BelongsToProxiedRelation from './belongs-to-proxied';

export default class BelongsToLoadedRelation extends BelongsToProxiedRelation {

  createObjectProxy(owner) {
    let _relation = this;
    return owner.lookup('sofa:belongs-to-loaded').create({ _relation });
  }

}

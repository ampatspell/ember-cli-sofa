import HasManyRelation from './has-many';

export default class HasManyLoadedRelation extends HasManyRelation {

  createArrayProxy(owner, content) {
    let _relation = this;
    return owner.lookup('sofa:has-many-loaded').create({ _relation, content });
  }

}

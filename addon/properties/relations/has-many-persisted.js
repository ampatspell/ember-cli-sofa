import HasManyRelation from './has-many';

export default class HasManyPersistedRelation extends HasManyRelation {

  createArrayProxy(owner, content) {
    let _relation = this;
    return owner.lookup('sofa:has-many-persisted').create({ _relation, content });
  }

}

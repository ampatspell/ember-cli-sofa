import HasManyRelation from './has-many';
import RelationLoader from './util/relation-loader';
import RelationQueryMixin from './query/relation';
import RelationFindQueryMixin from './query/relation-find';

export default class HasManyLoadedRelation extends HasManyRelation {

  constructor() {
    super(...arguments);
    this.loader = new RelationLoader(this);
  }

  createArrayProxy(owner, content) {
    let _relation = this;
    return owner.lookup('sofa:has-many-loaded').create({ _relation, content });
  }

  createQuery() {
    return this.relationship.createQuery(this, 'relation-find', Query => {
      return Query.extend(RelationQueryMixin, RelationFindQueryMixin);
    });
  }

  relationLoaderDidLoad(array) {
    this.setValue(array);
  }

}

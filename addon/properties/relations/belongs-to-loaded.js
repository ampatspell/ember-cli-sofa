import BelongsToProxiedRelation from './belongs-to-proxied';
import RelationQueryMixin from './query/relation';
import RelationFirstQueryMixin from './query/relation-first';
import RelationLoader from './relation-loader';

export default class BelongsToLoadedRelation extends BelongsToProxiedRelation {

  constructor() {
    super(...arguments);
    this.loader = new RelationLoader(this);
  }

  get notifyPropertyChangeProxyPropertyNames() {
    return [ 'content', 'promise' ];
  }

  createObjectProxy(owner) {
    let _relation = this;
    return owner.lookup('sofa:belongs-to-loaded').create({ _relation });
  }

  createQuery() {
    return this.relationship.createQuery(this, 'relation-first', Query => {
      return Query.extend(RelationQueryMixin, RelationFirstQueryMixin);
    });
  }

  relationLoaderDidLoad(internal) {
    this.withPropertyChanges(changed => {
      this.setContent(internal, changed);
    });
  }

  getModel() {
    this.loader.load();
    return super.getModel(...arguments);
  }

  serialize() {
  }

  deserialize() {
  }

}

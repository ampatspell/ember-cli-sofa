import BelongsToProxiedRelation from './belongs-to-proxied';
import QueryFindMixin from '../../util/query-find-mixin';
import RelationQueryMixin from './query/relation';
import RelationFirstQueryMixin from './query/relation-first';
import RelationLoader from './util/relation-loader';

export default class BelongsToLoadedRelation extends BelongsToProxiedRelation {

  constructor() {
    super(...arguments);
    this.loader = new RelationLoader(this);
  }

  get notifyPropertyChangeProxyPropertyNames() {
    return [ 'content', 'promise' ];
  }

  createObjectProxy(store) {
    return store._createBelongsToLoadedProxyForRelation(this);
  }

  createQuery() {
    return this.relationship.createQuery(this, 'relation-first', Query => {
      return Query.extend(QueryFindMixin, RelationQueryMixin, RelationFirstQueryMixin);
    });
  }

  relationLoaderDidLoad(internal) {
    this.withPropertyChanges(changed => {
      this.setContent(internal, changed);
    });
  }

  onWillGetModel() {
    this.loader.load();
  }

}

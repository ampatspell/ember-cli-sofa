import HasManyRelation from './has-many';
import RelationLoader from './util/relation-loader';
import QueryFindMixin from '../../util/query-find-mixin';
import RelationQueryMixin from './query/relation';
import RelationFindQueryMixin from './query/relation-find';

export default class HasManyLoadedRelation extends HasManyRelation {

  constructor() {
    super(...arguments);
    this.loader = new RelationLoader(this);
  }

  createArrayProxy(store, content) {
    return store._createHasManyLoadedProxyForRelation(this, content);
  }

  createQuery() {
    return this.relationship.createQuery(this, 'relation-find', Query => {
      return Query.extend(QueryFindMixin, RelationQueryMixin, RelationFindQueryMixin);
    });
  }

  relationLoaderDidLoad(array) {
    this.setValue(array);
  }

  serialize(type) {
    let isLoaded = this.loader.state.isLoaded;
    let content = this.serializeInternalModelsToDocIds(this.getContent(), type);
    return { isLoaded, content };
  }

  deserialize(value, changed) {
    let internals = this.deserializeDocIdsToModels(value.content);
    this.setValue(internals, changed);
    if(value.isLoaded) {
      this.loader.setLoaded();
    }
  }

}

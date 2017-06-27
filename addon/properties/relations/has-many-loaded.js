import HasManyRelation from './has-many';
import RelationLoader from './util/relation-loader';
import QueryFindMixin from '../../util/query-find-mixin';
import relationQueryMixinBuilder from './query/relation';
import RelationFindQueryMixin from './query/relation-find';

const RelationQueryMixin = relationQueryMixinBuilder({ requireSavedModel: true });

export default class HasManyLoadedRelation extends HasManyRelation {

  constructor() {
    super(...arguments);
    this.loader = new RelationLoader(this);
  }

  createArrayProxy(store, content) {
    return store._createHasManyLoadedProxyForRelation(this, content);
  }

  createQuery() {
    return this._createQuery({
      name: 'loaded-relation-find',
      prepare: Query => Query.extend(QueryFindMixin, RelationQueryMixin, RelationFindQueryMixin)
    });
  }

  valueQueryDidChange() {
    this.destroyQuery();
    this.loader.setNeedsReload();
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

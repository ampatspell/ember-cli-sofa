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

  createArrayProxy(owner, content) {
    let _relation = this;
    return owner.factoryFor('sofa:has-many-loaded').create({ _relation, content });
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
    let isLoaded = value.isLoaded;
    this.setValue(internals, changed);
    this.loader.setState({ isLoaded }, false);
  }

}

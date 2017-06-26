import Relation from './relation';
import RelationLoader from './util/relation-loader';
import QueryFindMixin from '../../util/query-find-mixin';
import relationQueryMixinBuilder from './query/relation';
import RelationFindQueryMixin from './query/relation-find';

const RelationQueryMixin = relationQueryMixinBuilder({ requireSavedModel: false });

export default class HasManyCollectionRelation extends Relation {

  constructor() {
    super(...arguments);
    this.loader = new RelationLoader(this);
  }

  get internalModels() {
    let database = this.database;
    if(!database) {
      return;
    }
    return database._modelIdentity.all;
  }

  createArrayProxy() {
    let store = this.relationship.store;
    return store._createHasManyCollectionProxyForRelation(this);
  }

  createQuery() {
    return this._createQuery({
      name: 'collection-relation-find',
      prepare: Query => Query.extend(QueryFindMixin, RelationQueryMixin, RelationFindQueryMixin)
    });
  }

  relationLoaderDidLoad() {
  }

  setValue() {
  }

  getValue() {
    let value = this.value;
    if(!value) {
      value = this.createArrayProxy();
      this.value = value;
    }
    return value;
  }

  destroyValue() {
    let value = this.value;
    if(!value) {
      return;
    }
    value.destroy();
    this.value = null;
  }

  get notifyInternalModelDidSetDatabase() {
    return true;
  }

  internalModelDidSetDatabase() {
    let value = this.value;
    if(value) {
      value.beginPropertyChanges();
      {
        value.notifyPropertyChange('database');
        value.notifyPropertyChange('models');
      }
      value.endPropertyChanges();
    }
  }

  load(notify) {
    if(!this.value) {
      return;
    }
    this.loader.load(notify);
  }

}

import Relation from './relation';
import RelationLoader from './util/relation-loader';
import QueryFindMixin from '../../util/query-find-mixin';
import relationQueryMixinBuilder from './query/relation';
import RelationFirstQueryMixin from './query/relation-first';
import {
  internalModelDidChangeInternalWillDestroy
} from '../../internal-model';

const RelationQueryMixin = relationQueryMixinBuilder({ requireSavedModel: false });

export default class BelongsToCollectionRelation extends Relation {

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

  createObjectProxy() {
    let store = this.relationship.store;
    return store._createBelongsToCollectionProxyForRelation(this);
  }

  createQuery() {
    return this._createQuery({
      name: 'collection-relation-first',
      prepare: Query => Query.extend(QueryFindMixin, RelationQueryMixin, RelationFirstQueryMixin)
    });
  }

  valueQueryDidChange() {
    this.destroyQuery();
    this.loader.setNeedsReload();
  }

  didCreateObjectProxy(value) {
    value.addObserver('query', this, 'valueQueryDidChange');
  }

  willDestroyObjectProxy(value) {
    value.removeObserver('query', this, 'valueQueryDidChange');
  }

  setValue() {
  }

  getValue() {
    let value = this.value;
    if(!value) {
      value = this.createObjectProxy();
      this.didCreateObjectProxy(value);
      this.value = value;
    }
    return value;
  }

  destroyValue() {
    let value = this.value;
    if(!value) {
      return;
    }
    this.willDestroyObjectProxy(value);
    value.destroy();
    this.value = null;
  }

  onInternalDestroyed() {
    this.destroyValue();
    super.onInternalDestroyed();
  }

  valueWillDestroy() {
    this.value = null;
    this.withPropertyChanges(changed => {
      this.propertyDidChange(changed);
    });
    super.valueWillDestroy();
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

  internalModelDidChange(internal, props) {
    super.internalModelDidChange(...arguments);
    if(internal === this.internal) {
      if(internalModelDidChangeInternalWillDestroy(internal, props)) {
        this.onInternalDestroyed();
      }
    }
  }

  relationLoaderDidLoad() {
  }

  serialize() {
    let isLoaded = this.loader.state.isLoaded;
    return { isLoaded };
  }

  deserialize(value) {
    if(value.isLoaded) {
      this.loader.setLoaded();
    }
  }

}

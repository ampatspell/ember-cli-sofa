import Ember from 'ember';
import Relation from './relation';
import RelationLoader from './util/relation-loader';
import QueryFindMixin from '../../util/query-find-mixin';
import RelationQueryMixin from './query/relation';
import RelationFindQueryMixin from './query/relation-find';

const {
  A
} = Ember;

export default class HasManyCollectionRelation extends Relation {

  constructor() {
    super(...arguments);
    this.loader = new RelationLoader(this);
  }

  createArrayProxy() {
    let content = this.getContent();
    let store = this.relationship.store;
    return store._createHasManyCollectionProxyForRelation(this, content);
  }

  createQuery() {
    return this._createQuery({
      name: 'relation-find',
      prepare: Query => Query.extend(QueryFindMixin, RelationQueryMixin, RelationFindQueryMixin)
    });
  }

  getContent() {
    return A();
  }

  setValue() {
  }

  getValue() {
    let value = this.value;
    if(!value) {
      value = this.createArrayProxy();
      // value.addObserver('query', this, 'valueQueryDidChange');
      this.value = value;
    }
    return value;
  }

  // destroyValue() {
  // }

}

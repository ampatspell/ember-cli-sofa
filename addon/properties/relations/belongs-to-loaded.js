import Ember from 'ember';
import BelongsToProxiedRelation from './belongs-to-proxied';
import RelationQueryMixin from './query/relation';
import RelationFirstQueryMixin from './query/relation-first';

const {
  RSVP: { resolve }
} = Ember;

export default class BelongsToLoadedRelation extends BelongsToProxiedRelation {

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

  queryNeedsReload() {
    let value = this.value;
    this.needsReload = true;
    value.notifyPropertyChange('promise');
  }

  createLoadPromise() {
    let query = this.getQuery();
    return query._find().then(internal => {
      this.withPropertyChanges(changed => {
        this.setContent(internal, changed);
      });
      return this.getValue();
    });
  }

  getLoadPromise() {
    let promise = this.loadPromise;
    if(!promise) {
      if(this.content && !this.needsReload) {
        return resolve(this.getValue());
      }
      this.needsReload = false;
      promise = this.createLoadPromise().finally(() => {
        this.loadPromise = null;
      });
      this.loadPromise = promise;
    }
    return promise;
  }

  serialize() {
  }

  deserialize() {
  }

}

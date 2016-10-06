import Ember from 'ember';
import BelongsToProxiedRelation from './belongs-to-proxied';
import RelationQueryMixin from './query/relation';
import RelationFirstQueryMixin from './query/relation-first';

const {
  RSVP: { resolve, reject },
  merge
} = Ember;

export default class BelongsToLoadedRelation extends BelongsToProxiedRelation {

  constructor(relationship, internal) {
    super(...arguments);
    // TODO: maybe add this.load = { state, promise, ... }
    this.loadState = {
      isLoading: false,
      isLoaded: false,
      isError: false,
      error: null
    };
  }

  get notifyPropertyChangeProxyPropertyNames() {
    return [ 'content', 'promise' ];
  }

  createObjectProxy(owner) {
    let _relation = this;
    return owner.lookup('sofa:belongs-to-loaded').create({ _relation });
  }

  setState(state) {
    // TODO: extract internal.withPropertyChanges.any
    for(let key in this.loadState) {
      if(!state.hasOwnProperty(key)) {
        state[key] = this.loadState[key];
      }
    }
    this.loadState = state;
    let value = this.value;
    if(value) {
      value.notifyPropertyChange('state');
    }
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

    this.setState({
      isLoading: true,
      isError: false,
      error: null
    });

    return query._find().then(internal => {
      this.withPropertyChanges(changed => {
        this.setContent(internal, changed);
      });
      this.setState({
        isLoading: false,
        isLoaded: true,
        isError: false,
        error: false
      });
      return this.getValue();
    }, err => {
      this.setState({
        isLoading: false,
        isError: true,
        error: err
      });
      return reject(err);
    })
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

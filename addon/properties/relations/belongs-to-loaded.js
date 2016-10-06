import Ember from 'ember';
import BelongsToProxiedRelation from './belongs-to-proxied';
import RelationQueryMixin from './query/relation';
import RelationFirstQueryMixin from './query/relation-first';

const {
  RSVP: { resolve, reject }
} = Ember;

export default class BelongsToLoadedRelation extends BelongsToProxiedRelation {

  constructor() {
    super(...arguments);
    this.load = {
      state: {
        isLoading: false,
        isLoaded: false,
        isError: false,
        error: null
      },
      needsReload: false,
      promise: null,
    };
  }

  get notifyPropertyChangeProxyPropertyNames() {
    return [ 'content', 'promise' ];
  }

  createObjectProxy(owner) {
    let _relation = this;
    return owner.lookup('sofa:belongs-to-loaded').create({ _relation });
  }

  setLoadState(state) {
    // TODO: extract internal.withPropertyChanges.any
    for(let key in this.load.state) {
      if(!state.hasOwnProperty(key)) {
        state[key] = this.load.state[key];
      }
    }
    this.load.state = state;
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
    this.load.needsReload = true;
    value.notifyPropertyChange('promise');
  }

  createLoadPromise() {
    let query = this.getQuery();

    this.setLoadState({
      isLoading: true,
      isError: false,
      error: null
    });

    return query._find().then(internal => {
      this.withPropertyChanges(changed => {
        this.setContent(internal, changed);
      });
      this.setLoadState({
        isLoading: false,
        isLoaded: true,
        isError: false,
        error: false
      });
      return this.getValue();
    }, err => {
      this.setLoadState({
        isLoading: false,
        isError: true,
        error: err
      });
      return reject(err);
    });
  }

  getLoadPromise() {
    let promise = this.load.promise;
    if(!promise) {
      if(this.content && !this.load.needsReload) {
        return resolve(this.getValue());
      }
      this.load.needsReload = false;
      promise = this.createLoadPromise().finally(() => {
        this.load.promise = null;
      });
      this.load.promise = promise;
    }
    return promise;
  }

  getLoadState() {
    this.getLoadPromise();
    return this.load.state;
  }

  serialize() {
  }

  deserialize() {
  }

}

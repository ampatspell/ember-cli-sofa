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

  createQuery() {
    return this.relationship.createQuery(this, 'relation-first', Query => {
      return Query.extend(RelationQueryMixin, RelationFirstQueryMixin);
    });
  }

  setLoadState(state, notify=true) {
    for(let key in this.load.state) {
      if(!state.hasOwnProperty(key)) {
        state[key] = this.load.state[key];
      }
    }
    this.load.state = state;
    let value = this.value;
    if(value && notify) {
      value.notifyPropertyChange('state');
    }
  }

  queryNeedsReload() {
    let value = this.value;
    this.load.needsReload = true;
    value.notifyPropertyChange('promise');
  }

  createLoadPromise(notifyInitialStateChange=true) {
    let query = this.getQuery();

    this.setLoadState({
      isLoading: true,
      isError: false,
      error: null
    }, notifyInitialStateChange);

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

  getLoadPromise(notifyInitialStateChange=true) {
    let promise = this.load.promise;
    if(!promise) {
      if(this.content && !this.load.needsReload) {
        return resolve(this.getValue());
      }
      this.load.needsReload = false;
      promise = this.createLoadPromise(notifyInitialStateChange).finally(() => {
        this.load.promise = null;
      });
      this.load.promise = promise;
    }
    return promise;
  }

  getLoadState() {
    this.getLoadPromise(false);
    return this.load.state;
  }

  getModel() {
    this.getLoadPromise();
    return super.getModel(...arguments);
  }

  serialize() {
  }

  deserialize() {
  }

}

import Ember from 'ember';

const {
  RSVP: { resolve, reject }
} = Ember;

export default class RelationLoader {

  constructor(relation) {
    this.relation = relation;
    this.state = {
      isLoading: false,
      isLoaded: false,
      isError: false,
      error: null
    };
    this.needed = true;
    this.promise = null;
  }

  getProxy() {
    return this.relation.value;
  }

  getQuery() {
    return this.relation.getQuery();
  }

  setState(state, notify=true) {
    for(let key in this.state) {
      if(!state.hasOwnProperty(key)) {
        state[key] = this.state[key];
      }
    }
    this.state = state;
    let proxy = this.getProxy();
    if(proxy && notify) {
      proxy.notifyPropertyChange('state');
    }
  }

  setNeedsReload() {
    this.needed = true;
    let proxy = this.getProxy();
    proxy.beginPropertyChanges();
    {
      proxy.notifyPropertyChange('promise');
      proxy.notifyPropertyChange('content');
    }
    proxy.endPropertyChanges();
  }

  createPromise(notify=true) {
    let query = this.getQuery();

    this.setState({
      isLoading: true,
      isError: false,
      error: null
    }, notify);

    return query._find().then(result => {
      this.relation.relationLoaderDidLoad(result);
      this.setState({
        isLoading: false,
        isLoaded: true,
        isError: false,
        error: false
      });
      return this.getProxy();
    }, err => {
      this.setState({
        isLoading: false,
        isError: true,
        error: err
      });
      return reject(err);
    });
  }

  shouldCreatePromise() {
    if(!this.needed) {
      return false;
    }
    let query = this.getQuery();
    if(!query.get('_isLoadable')) {
      return false;
    }
    return true;
  }

  getPromise(notify) {
    let promise = this.promise;
    if(!promise) {
      if(!this.shouldCreatePromise()) {
        return resolve(this.getProxy());
      }
      this.needed = false;
      promise = this.createPromise(notify).finally(() => {
        this.promise = null;
      });
      this.promise = promise;
    }
    return promise;
  }

  load(notify) {
    this.getPromise(notify);
  }

  getState() {
    this.load(false);
    return this.state;
  }

}

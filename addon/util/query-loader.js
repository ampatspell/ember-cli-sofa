import Ember from 'ember';

const {
  RSVP: { resolve, reject }
} = Ember;

export default class QueryLoader {

  constructor() {
    this.state = {
      isLoading: false,
      isLoaded: false,
      isError: false,
      error: null
    };
    this.needed = true;
    this.promise = null;
  }

  // getProxy() {
  // }

  // getQuery() {
  // }

  // didLoad(results) {
  // }

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
      proxy.notifyPropertyChange('state');
    }
    proxy.endPropertyChanges();
  }

  setLoaded(notify) {
    this.setState({ isLoaded: true }, notify);
    this.needed = false;
  }

  createPromise(notify=true) {
    let query = this.getQuery();

    this.setState({
      isLoading: true,
      isError: false,
      error: null
    }, notify);

    return query._find().then(result => {
      this.didLoad(result);
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
    if(!query) {
      return false;
    }
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
      const done = arg => {
        if(this.promise === promise) {
          this.promise = null;
        }
        return arg;
      };
      promise = this.createPromise(notify).then(arg => done(resolve(arg)), err => done(reject(err)));
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

export default class InternalChanges {

  constructor(changesClass, opts) {
    this.changesClass = changesClass;
    this.opts = opts;
    this.changesModel = null;
    this.listener = null;
    this.listenerBindings = {
      data: this.onData.bind(this),
      error: this.onError.bind(this)
    };
    this.state = {
      isError: false,
      error: null
    };
  }

  _setStateProperty(key, hash) {
    let state = this.state;
    if(state[key] !== hash[key]) {
      state[key] = hash[key];
      this.notifyPropertyChange(key);
    }
  }

  setState(hash) {
    this.withPropertyChanges(() => {
      this._setStateProperty('isError', hash);
      this._setStateProperty('error', hash);
    });
  }

  getChangesModel() {
    let model = this.changesModel;
    if(!model) {
      model = this.createChangesModel();
      this.changesModel = model;
    }
    return model;
  }

  getListener(notify=true) {
    let listener = this.listener;
    if(!listener) {
      listener = this.createListener();
      this.listener = listener;
      let bindings = this.listenerBindings;
      for(let key in bindings) {
        listener.on(key, bindings[key]);
      }
      if(notify) {
        this.notifyPropertyChange('_listener');
      }
    }
    return listener;
  }

  destroyListener() {
    let listener = this.listener;
    if(!listener) {
      return;
    }
    let bindings = this.listenerBindings;
    for(let key in bindings) {
      listener.off(key, bindings[key]);
    }
    listener.destroy();
    this.listener = null;
    this.notifyPropertyChange('_listener');
  }

  start() {
    this.getListener().start();
  }

  stop() {
    this.getListener().stop();
    this.setState({ isError: false, error: null });
  }

  restart() {
    this.getListener().restart();
  }

  //

  suspend() {
    return this.getListener().suspend();
  }

  //

  withPropertyChanges(cb) {
    let model = this.changesModel;
    if(model) {
      model.beginPropertyChanges();
    }
    cb();
    if(model) {
      model.endPropertyChanges();
    }
  }

  notifyPropertyChange(key) {
    let model = this.changesModel;
    if(!model) {
      return;
    }
    model.notifyPropertyChange(key);
  }

  triggerModel(name, arg) {
    let model = this.changesModel;
    if(!model) {
      return;
    }
    model.trigger(name, arg);
  }

  onData(json) {
    let result = this.processData(json);
    if(!result) {
      return;
    }
    this.setState({ isError: false, error: null });
    this.triggerModel('change', result);
  }

  onError(err) {
    this.setState({ isError: true, error: err });
    this.triggerModel('error', err);
  }

  //

  changesWillDestroy() {
    this.destroyListener();
  }

  destroy() {
    let model = this.changesModel;
    if(model) {
      model.destroy();
    }
  }

}

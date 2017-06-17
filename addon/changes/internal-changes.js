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
  }

  getState() {
    return {
      isStarted: false,
      isSuspended: false,
      isError: false,
      error: null
    };
  }

  setState() {
  }

  getChangesModel() {
    let model = this.changesModel;
    if(!model) {
      model = this.createChangesModel();
      this.changesModel = model;
    }
    return model;
  }

  getListener() {
    let listener = this.listener;
    if(!listener) {
      listener = this.createListener();
      this.listener = listener;
      let bindings = this.listenerBindings;
      for(let key in bindings) {
        listener.on(key, bindings[key]);
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
  }

  start() {
    this.getListener().start();
  }

  stop() {
    this.getListener().stop();
  }

  restart() {
    this.getListener().restart();
  }

  //

  suspend() {
    return this.getListener().suspend();
  }

  //

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
    this.triggerModel('change', result);
  }

  onError(err) {
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

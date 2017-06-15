import Ember from 'ember';

const {
  merge
} = Ember;

export default class InternalChanges {

  constructor(database, changesClass, identifier, opts) {
    this.database = database;
    this.changesClass = changesClass;
    this.identifier = identifier;
    this.opts = opts;
    this.changesModel = null;
    this.listener = null;
    this.listenerBindings = {
      data: this.onData.bind(this),
      error: this.onError.bind(this)
    };
  }

  createChangesModel() {
    return this.database._createChangesForInternalChanges(this);
  }

  getChangesModel() {
    let model = this.changesModel;
    if(!model) {
      model = this.createChangesModel();
      this.changesModel = model;
    }
    return model;
  }

  optionsForListener() {
    let model = this.getChangesModel();
    return merge({
      include_docs: true
    }, model.getProperties([
      'feed',
      'view',
      'filter',
      'timeout',
      'attachments',
      'heartbeat',
      'since'
    ]));
  }

  getListener() {
    let listener = this.listener;
    if(!listener) {
      listener = this.database.get('documents').changes(this.optionsForListener());
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

  triggerModel(name, arg) {
    let model = this.changesModel;
    if(!model) {
      return;
    }
    model.trigger(name, arg);
  }

  onData(json) {
    let doc = json.doc;
    if(!doc) {
      return;
    }

    let result = this.database.push(doc, { optional: true, instantiate: false });
    if(!result) {
      return;
    }

    this.triggerModel('change', result);
  }

  onError(err) {
    this.triggerModel('error', err);
  }

  //

  suspend() {
    return this.getListener().suspend();
  }

  //

  changesWillDestroy() {
    this.destroyListener();
    this.database._onInternalChangesDestroyed(this);
  }

  destroy() {
    let model = this.changesModel;
    if(model) {
      model.destroy();
    }
  }

}

import Ember from 'ember';
import EmptyObject from './util/empty-object';
import { assert } from './util/assert';
import { getDefinition } from './model';
import Relationship from './properties/relationship';

const {
  Logger: { error }
} = Ember;

export const internalPropertyName = '_internal';

export function getInternalModel(model) {
  if(model instanceof InternalModel) {
    return model;
  }
  return model.get('_internal');
}

export function internalModelDidChangeIsDeleted(internal, props) {
  return internal.state.isDeleted && props.includes('isDeleted');
}

export default class InternalModel {

  constructor(store, modelClass, database = null) {
    this.store = store;
    this.modelClass = modelClass;
    this.definition = getDefinition(modelClass);
    this.values = new EmptyObject();
    this.raw = null;
    this._database = database;
    this.model = null;
    this.loadPromise = null;
    this.boundNotifyPropertyChange = this.notifyPropertyChange.bind(this);
    this.observers = Ember.A();
    this.state = {
      isNew: true,
      isLoading: false,
      isLoaded: false,
      isDirty: false,
      isSaving: false,
      isDeleted: false,
      isError: false,
      error: null
    };
  }

  get lazyLoadEnabled() {
    return this.store.get('isLazyLoadEnabled');
  }

  get modelName() {
    return this.definition.modelName;
  }

  get docId() {
    let modelId = this.values.id;
    return this.definition.docId(modelId);
  }

  get rev() {
    return this.values.rev;
  }

  get database() {
    return this._database;
  }

  set database(database) {
    if(this._database !== database) {
      assert({ error: 'internal', reason: 'Database can be set only while model is new' }, this.state.isNew);
      this._database = database;
    }
  }

  notifyPropertyChange(key) {
    let model = this.model;
    if(!model) {
      return;
    }
    model.notifyPropertyChange(key);
  }

  withPropertyChanges(cb, notify) {
    let model = this.model;
    let notifyModel = notify;
    if(!model) {
      notifyModel = false;
    }

    if(notifyModel) {
      model.beginPropertyChanges();
    }

    let props = Ember.A();

    let changed = key => {
      Ember.assert(`call changed(key) with key`, (typeof key === 'string'));
      if(notifyModel) {
        model.notifyPropertyChange(key);
      }
      changed.any = true;
      if(notify && props.indexOf(key) === -1) {
        props.push(key);
      }
    };

    changed.props = props;

    cb(changed);

    if(notifyModel) {
      model.endPropertyChanges();
    }

    if(props.length) {
      this.notifyObservers(changed.props);
    }
  }

  notifyObservers(props) {
    this.observers.forEach(observer => {
      observer.internalModelDidChange(this, props);
    });
  }

  addObserver(object) {
    this.observers.addObject(object);
  }

  removeObserver(object) {
    this.observers.removeObject(object);
  }

  _setState(props, changed) {
    let state = this.state;
    for(let key in props) {
      let value = props[key];
      if(state[key] !== value) {
        state[key] = value;
        changed(key);
      }
    }
    if(changed.any) {
      changed('state');
    }
  }

  setState(props, notify) {
    this.withPropertyChanges(changed => {
      this._setState(props, changed);
    }, notify);
  }

  onLoading(changed) {
    this._setState({
      isLoading: true,
      isError: false,
      error: null
    }, changed);
  }

  onLoaded(changed) {
    this._setState({
      isNew: false,
      isLoading: false,
      isLoaded: true,
      isDirty: false,
      isSaving: false,
      isDeleted: false,
      isError: false,
      error: null
    }, changed);
  }

  onDeleting(changed) {
    this.onSaving(changed);
  }

  onDeleted(changed) {
    this._setState({
      isNew: false,
      isLoading: false,
      isLoaded: true,
      isDirty: false,
      isSaving: false,
      isDeleted: true,
      isError: false,
      error: null
    }, changed);
  }

  onSaving(changed) {
    this._setState({
      isSaving: true,
      isError: false,
      error: null
    }, changed);
  }

  onSaved(changed) {
    this._setState({
      isNew: false,
      isLoading: false,
      isLoaded: true,
      isDirty: false,
      isSaving: false,
      isDeleted: false,
      isError: false,
      error: null
    }, changed);
  }

  onError(error, changed) {
    this._setState({
      isLoading: false,
      isSaving: false,
      isError: true,
      error
    }, changed);
  }

  onDirty(changed) {
    if(this.state.isDirty) {
      return;
    }
    this.state.isDirty = true;
    changed('isDirty');
  }

  getValue(key) {
    return this.values[key];
  }

  setValue(key, value, changed) {
    if(this.values[key] === value) {
      return value;
    }
    this.values[key] = value;
    changed(key);
    return value;
  }

  getRelation(key) {
    let property = this.definition.property(key);
    if(!property) {
      return;
    }
    if(!(property instanceof Relationship)) {
      return;
    }
    return property.getRelation(this);
  }

  getModel(props) {
    let model = this.model;
    if(!model) {
      model = this.store._createModelForInternalModel(this, props);
      this.model = model;
    }
    return model;
  }

  reportLazyLoadError(message, err) {
    let info = err.toJSON ? err.toJSON() : err.stack;
    error(`Lazy load failed for ${message}`, info);
  }

  shouldLazyLoad(checkForExistingLoad) {
    if(!this.lazyLoadEnabled) {
      return;
    }
    if(checkForExistingLoad && this.loadPromise) {
      return;
    }
    let state = this.state;
    return !state.isNew && !state.isLoaded && !state.isLoading && !state.isDeleted && !state.isSaving;
  }

  setLazyLoadModelPromise(promise) {
    if(this.loadPromise) {
      return;
    }
    this.loadPromise = promise.finally(() => {
      if(this.loadPromise === promise) {
        this.loadPromise = null;
      }
    });
  }

  createLazyLoadPromise() {
    let model = this.model;
    return model.load().catch(err => {
      this.reportLazyLoadError(`{ model: '${model.get('modelName')}', _id: '${model.get('docId')}' }`, err);
    });
  }

  enqueueLazyLoadModelIfNeeded() {
    if(!this.shouldLazyLoad(true)) {
      return;
    }
    this.setLazyLoadModelPromise(this.createLazyLoadPromise());
  }

}

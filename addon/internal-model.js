import EmptyObject from './util/empty-object';
import { assert } from './util/assert';
import { getDefinition } from './model';

export const internalPropertyName = '_internal';

export function getInternalModel(model) {
  return model.get('_internal');
}

export default class InternalModel {

  constructor(store, modelClass, database = null) {
    this.store = store;
    this.modelClass = modelClass;
    this.definition = getDefinition(modelClass);
    this.values = new EmptyObject();
    this.doc = null;
    this._database = database;
    this.model = null;
    this.boundNotifyPropertyChange = this.notifyPropertyChange.bind(this);
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
    if(!model) {
      notify = false;
    }

    if(notify) {
      model.beginPropertyChanges();
    }

    let changed = key => {
      if(notify) {
        model.notifyPropertyChange(key);
      }
      changed.any = true;
    };

    cb(changed);

    if(notify) {
      model.endPropertyChanges();
    }
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

  getModel(props) {
    let model = this.model;
    if(!model) {
      model = this.store._createModelForInternalModel(this, props);
      this.model = model;
    }
    return model;
  }

}

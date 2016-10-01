import Ember from 'ember';
import EmptyObject from './util/empty-object';
import { assert } from './util/assert';
import { getDefinition } from './model';

const {
  get
} = Ember;

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
    this._database = database;
    this.model = null;
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
    return get(this.modelClass, 'modelName');
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

  setState(props, notify) {
    this.withPropertyChanges(changed => {
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
    }, notify);
  }

  onLoaded(notify) {
    this.setState({
      isNew: false,
      isLoading: false,
      isLoaded: true,
      isDirty: false,
      isSaving: false,
      isDeleted: false,
      isError: false,
      error: null
    }, notify);
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

  setValue(key, value) {
    if(this.values[key] === value) {
      return value;
    }
    this.values[key] = value;
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

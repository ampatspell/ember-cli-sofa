import EmptyObject from './empty-object';

export const internalPropertyName = '_internal';

export function getInternalModel(model) {
  return model.get('_internal');
}

export default class InternalModel {

  constructor(internalStore, modelClass, database = null) {
    this.internalStore = internalStore;
    this.modelClass = modelClass;
    this.values = new EmptyObject();
    this.database = database;
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

  getValue(key) {
    return this.values[key];
  }

  setValue(key, value) {
    this.values[key] = value;
    return value;
  }

  getModel() {
    let model = this.model;
    if(!model) {
      model = this.internalStore.createModelForInternalModel(this);
      this.model = model;
    }
    return model;
  }

  deserialize(doc, notify) {
    this.withPropertyChanges(changed => {
      for(let key in doc) {
        this.setValue(key, doc[key]);
        changed(key);
      }
    }, notify);
  }

}

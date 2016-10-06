import Ember from 'ember';

const {
  merge,
  copy,
  computed
} = Ember;

let props = {
  isLoading: false,
  isLoaded: false,
  isDirty: false,
  isSaving: false,
  isError: false,
  error: null,
};

let stateProperty = (prop) => {
  return computed(function() {
    return this.get('state')[prop];
  }).readOnly();
};

let state = () => {
  return computed(function() {
    return copy(props);
  }).readOnly();
};

let hash = {};

for(let key in props) {
  hash[key] = stateProperty(key);
}

let setter = (arg) => {
  return function() {
    if(this.isDestroying) {
      return;
    }

    let hash;

    if(typeof arg === 'function') {
      hash = arg.call(this, ...arguments);
    } else {
      hash = arg;
    }

    this.beginPropertyChanges();
    {
      let state = this.get('state');
      for(let key in state) {
        if(state[key] !== hash[key]) {
          state[key] = hash[key];
          this.notifyPropertyChange(key);
        }
      }
    }
    this.endPropertyChanges();
  };
};

export default Ember.Mixin.create(merge(hash, {

  state: state(),

  onDirty: setter({
    isDirty: true
  }),

  onNew: setter({
    isLoading: false,
    isLoaded: false,
    isDirty: false,
    isSaving: false,
    isError: false,
    error: null
  }),

  onLoading: setter({
    isLoading: true,
    isError: false,
    error: null
  }),

  onLoaded: setter({
    isLoading: false,
    isLoaded: true,
    isDirty: false,
    isSaving: false,
    isError: false,
    error: null
  }),

  onSaving: setter({
    isSaving: true,
    isError: false,
    error: null
  }),

  onSaved: setter({
    isLoading: false,
    isLoaded: true,
    isDirty: false,
    isSaving: false,
    isError: false,
    error: null
  }),

  onError: setter(function(error) {
    return {
      isLoading: false,
      isSaving: false,
      isError: true,
      error
    };
  })

}));

import Ember from 'ember';
import Identifier from './identifier';
import PrefixedIdentifier from './prefixed-identifier';
import Revision from './revision';
import Type from './type';
import Attribute from './attribute';
import BelongsToPersisted from './belongs-to-persisted';
import BelongsToLoaded from './belongs-to-loaded';
import HasManyPersisted from './has-many-persisted';
import HasManyLoaded from './has-many-loaded';

const {
  computed
} = Ember;

const __sofa = true;

function make(property) {
  return computed({
    get(key) {
      return property.getPropertyValue(this, key);
    },
    set(key, value) {
      return property.setPropertyValue(this, value, key);
    }
  }).meta({ __sofa, property });
}

function attr(transform, opts) {
  if(typeof transform === 'object') {
    opts = transform;
    transform = undefined;
  }
  return make(new Attribute(transform, opts));
}

function id() {
  return make(new Identifier());
}

function prefix(value) {
  return make(new PrefixedIdentifier(value));
}

function rev() {
  return make(new Revision());
}

function type(value, opts) {
  if(typeof value === 'object') {
    opts = value;
    value = opts.value;
    delete opts.value;
  }
  return make(new Type(value, opts));
}

function belongsTo(modelName, opts={}) {
  if(opts.query) {
    return make(new BelongsToLoaded(modelName, opts));
  } else {
    return make(new BelongsToPersisted(modelName, opts));
  }
}

function hasMany(modelName, opts={}) {
  if(opts.query) {
    return make(new HasManyLoaded(modelName, opts));
  } else {
    return make(new HasManyPersisted(modelName, opts));
  }
}

export {
  id,
  prefix,
  rev,
  type,
  attr,
  belongsTo,
  hasMany
};

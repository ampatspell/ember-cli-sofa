import Ember from 'ember';
import Identifier from './identifier';
import PrefixedIdentifier from './prefixed-identifier';
import Revision from './revision';
import Type from './type';
import Attribute from './attribute';
import BelongsToPersisted from './belongs-to-persisted';
// import HasManyPersisted from './has-many-persisted';

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

function type(value) {
  return make(new Type(value));
}

function belongsTo(modelName, opts) {
  return make(new BelongsToPersisted(modelName, opts));
}

// function hasMany(modelName, opts) {
//   return make(new HasManyPersisted(modelName, opts));
// }

export {
  id,
  prefix,
  rev,
  type,
  attr,
  belongsTo
  // hasMany
};

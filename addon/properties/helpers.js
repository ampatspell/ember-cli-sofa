import Ember from 'ember';
import Identifier from './identifier';
import PrefixedIdentifier from './prefixed-identifier';
import Revision from './revision';
import Attachments from './attachments';
import Type from './type';
import Attribute from './attribute';
import BelongsToPersisted from './belongs-to-persisted';
import BelongsToLoaded from './belongs-to-loaded';
import HasManyPersisted from './has-many-persisted';
import HasManyLoaded from './has-many-loaded';

const {
  computed,
  merge
} = Ember;

const __sofa = true;

function makeMeta(arg) {
  let meta;
  if(typeof arg === 'function') {
    meta = { build: arg };
  } else {
    meta = { property: arg };
  }
  return merge({ __sofa }, meta);
}

function make(arg) {
  let property = computed({
    get(key) {
      return property._meta.property.getPropertyValue(this, key);
    },
    set(key, value) {
      return property._meta.property.setPropertyValue(this, value, key);
    }
  }).meta(makeMeta(arg));
  return property;
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

function attachments(opts) {
  return make(new Attachments(opts));
}

function type(value, opts) {
  if(typeof value === 'object') {
    opts = value;
    value = opts.value;
    delete opts.value;
  }
  return make(new Type(value, opts));
}

function isLoadedRelationship(store, opts) {
  if(opts.query) {
    return true;
  }
  let relationship = opts.relationship;
  if(relationship) {
    let builder = store._relationshipMixinBuilderForName(relationship);
    return builder.isLoaded();
  }
  return false;
}

function belongsTo(modelName, opts={}) {
  return make(store => {
    if(isLoadedRelationship(store, opts)) {
      return new BelongsToLoaded(modelName, opts);
    } else {
      return new BelongsToPersisted(modelName, opts);
    }
  });
}

function hasMany(modelName, opts={}) {
  return make(store => {
    if(isLoadedRelationship(store, opts)) {
      return new HasManyLoaded(modelName, opts);
    } else {
      return new HasManyPersisted(modelName, opts);
    }
  });
}

export {
  id,
  prefix,
  rev,
  attachments,
  type,
  attr,
  belongsTo,
  hasMany
};

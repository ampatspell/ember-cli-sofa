import Ember from 'ember';
import HasMany from './has-many';
import HasManyLoadedRelation from './relations/has-many-loaded';

const {
  merge
} = Ember;

export default class HasManyLoaded extends HasMany {

  constructor(relationshipModelName, opts) {
    super(relationshipModelName, merge({ persist: false }, opts));
  }

  get serializeShoebox() {
    return true;
  }

  get deserializeShoebox() {
    return true;
  }

  createRelation(internal) {
    return new HasManyLoadedRelation(this, internal);
  }

}

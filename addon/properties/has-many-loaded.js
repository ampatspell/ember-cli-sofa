import HasMany from './has-many';
import HasManyLoadedRelation from './relations/has-many-loaded';

export default class HasManyLoaded extends HasMany {

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

import HasMany from './has-many';
import HasManyLoadedRelation from './relations/has-many-loaded';

export default class HasManyLoaded extends HasMany {

  createRelation(internal) {
    return new HasManyLoadedRelation(this, internal);
  }

}

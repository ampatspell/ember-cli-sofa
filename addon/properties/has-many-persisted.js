import HasMany from './has-many';
import HasManyPersistedRelation from './relations/has-many-persisted';

export default class HasManyPersisted extends HasMany {

  createRelation(internal) {
    return new HasManyPersistedRelation(this, internal);
  }

}

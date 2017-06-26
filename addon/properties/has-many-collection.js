import HasManyLoaded from './has-many-loaded';
import HasManyCollectionRelation from './relations/has-many-collection';

export default class HasManyCollection extends HasManyLoaded {

  createRelation(internal) {
    return new HasManyCollectionRelation(this, internal);
  }

}

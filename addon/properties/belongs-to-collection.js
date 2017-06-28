import BelongsToLoaded from './belongs-to-loaded';
import BelongsToCollectionRelation from './relations/belongs-to-collection';

export default class BelongsToCollection extends BelongsToLoaded {

  createRelation(internal) {
    return new BelongsToCollectionRelation(this, internal);
  }

}

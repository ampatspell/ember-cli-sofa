import BelongsTo from './belongs-to';
import BelongsToLoadedRelation from './relations/belongs-to-loaded';

export default class BelongsToLoaded extends BelongsTo {

  createRelation(internal) {
    return new BelongsToLoadedRelation(this, internal);
  }

}

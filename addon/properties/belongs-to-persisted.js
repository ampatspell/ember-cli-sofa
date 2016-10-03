import BelongsTo from './belongs-to';
import BelongsToPersistedRelation from './relations/belongs-to-persisted';

export default class BelongsToPersisted extends BelongsTo {

  createRelation(internal) {
    return new BelongsToPersistedRelation(this, internal);
  }

}

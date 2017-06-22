import Ember from 'ember';
import BelongsTo from './belongs-to';
import BelongsToLoadedRelation from './relations/belongs-to-loaded';

const {
  merge
} = Ember;

export default class BelongsToLoaded extends BelongsTo {

  constructor(relationshipModelName, opts) {
    super(relationshipModelName, merge({ persist: false }, opts));
  }

  createRelation(internal) {
    return new BelongsToLoadedRelation(this, internal);
  }

}

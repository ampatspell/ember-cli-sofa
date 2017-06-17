import DatabaseInternalChanges from '../changes/database/internal-changes';
import changes from '../changes/mixins/changes';

export default changes({

  _createInternalChanges(changesClass, identifier, opts) {
    return new DatabaseInternalChanges(this, changesClass, identifier, opts);
  }

});

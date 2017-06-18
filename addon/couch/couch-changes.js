import CouchInternalChanges from '../changes/couch/internal-changes';
import changes from '../changes/mixins/changes';

export default changes({

  _createInternalChanges(changesClass, identifier, opts) {
    return new CouchInternalChanges(this, changesClass, identifier, opts);
  }

});

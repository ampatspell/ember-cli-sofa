import InternalChanges from '../internal-changes';

export default class CouchInternalChanges extends InternalChanges {

  constructor(couch, changesClass, identifier, opts) {
    super(changesClass, opts);
    this.couch = couch;
    this.identifier = identifier;
  }

  createChangesModel() {
    return this.couch._createChangesForInternalChanges(this);
  }

  optionsForListener() {
    let model = this.getChangesModel();
    return model.getProperties([
      'feed',
      'timeout',
      'heartbeat',
      'since'
    ]);
  }

  createListener() {
    return this.couch.get('documents').changes(this.optionsForListener());
  }

  processData(json) {
    let { db_name: name, type } = json;

    return {
      type,
      name
    };
  }

  changesWillDestroy() {
    super.changesWillDestroy();
    this.couch._onInternalChangesDestroyed(this);
  }

}

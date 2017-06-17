import Ember from 'ember';
import InternalChanges from '../internal-changes';

const {
  merge
} = Ember;

export default class DatabaseInternalChanges extends InternalChanges {

  constructor(database, changesClass, identifier, opts) {
    super(changesClass, opts);
    this.database = database;
    this.identifier = identifier;
  }

  createChangesModel() {
    return this.database._createChangesForInternalChanges(this);
  }

  optionsForListener() {
    let model = this.getChangesModel();
    return merge({
      include_docs: true
    }, model.getProperties([
      'feed',
      'view',
      'filter',
      'timeout',
      'attachments',
      'heartbeat',
      'since'
    ]));
  }

  createListener() {
    return this.database.get('documents').changes(this.optionsForListener())
  }

  processData(json) {
    let doc = json.doc;
    if(!doc) {
      return;
    }
    return this.database.push(doc, { optional: true, instantiate: false });
  }

  changesWillDestroy() {
    super.changesWillDestroy();
    this.database._onInternalChangesDestroyed(this);
  }

}

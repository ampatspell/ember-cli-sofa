import Ember from 'ember';
import CouchSession from './couch/couch-session';
import CouchChanges from './couch/couch-changes';
import CouchInternalChangesIdentity from './couch/couch-internal-changes-identity';
import CouchOperations from './couch/couch-operations';
import CouchDestroy from './couch/couch-destroy';

const {
  computed: { reads }
} = Ember;

const url = () => {
  return reads('documents.url');
};

const store = () => {
  return reads('couches.store');
};

export default Ember.Object.extend(
  CouchSession,
  CouchChanges,
  CouchInternalChangesIdentity,
  CouchOperations,
  CouchDestroy, {

  documents: null,

  store: store(),
  url: url()

});

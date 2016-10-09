import Ember from 'ember';
import InternalModel, { getInternalModel } from '../../internal-model';
import Model from '../../model';
import Error from '../../util/error';

const {
  assert
} = Ember;

export default class Relation {

  constructor(relationship, internal) {
    this.relationship = relationship;
    this.internal = internal;
    this.value = null;
  }

  get relationshipModelName() {
    return this.relationship.relationshipModelName;
  }

  get relationshipModelClass() {
    return this.relationship.relationshipModelClass;
  }

  get database() {
    return this.internal.database;
  }

  get relationshipDatabase() {
    return this.relationship.getRelationshipDatabase(this.internal);
  }

  get store() {
    return this.internal.store;
  }

  getQuery() {
    let query = this.query;
    if(!query) {
      query = this.createQuery();
      this.query = query;
    }
    return query;
  }

  getInverseRelation(internal) {
    if(!internal) {
      return;
    }
    let key = this.relationship.opts.inverse;
    if(!key) {
      return;
    }
    return internal.getRelation(key);
  }

  assertModelMatchesRelationshipDatabase(internal) {
    let expected = this.relationshipDatabase;
    let actual = internal.database;
    if(expected === actual) {
      return;
    }
    throw new Error({
      error: 'invalid_relationship',
      reason: `${this.internal.modelName} '${this.internal.docId}' relationship '${this.relationship.name}': ${internal.modelName} '${internal.docId}' is expected to be saved in '${expected.get('identifier')}' database, not in '${actual.get('identifier')}'`
    });
  }

  deserializeDocIdToInternalModel(docId) {
    let internal = this.relationshipDatabase._deserializeDocIdToInternalModel(this.relationshipModelClass, docId);
    if(internal.state.isDeleted) {
      return null;
    }
    return internal;
  }

  serializeInternalModelToDocId(internal, preview) {
    if(!internal) {
      return null;
    }
    if(!preview) {
      this.assertModelMatchesRelationshipDatabase(internal);
    }
    if(internal.state.isDeleted) {
      return null;
    }
    let docId = internal.docId;
    return docId || null;
  }

  toInternalModel(object) {
    if(object instanceof InternalModel) {
      return object;
    }
    if(Ember.ObjectProxy.detectInstance(object)) {
      object = object.get('content');
    }
    assert(`ObjectProxy.content is ObjectProxy`, !Ember.ObjectProxy.detectInstance(object));
    if(Model.detectInstance(object)) {
      return getInternalModel(object);
    }
    return null;
  }

  onInternalDestroyed() {
    this.internal.removeObserver(this);
    this.internal = null;
    this.relationship = null;
    this.destroyed = true;
  }

}

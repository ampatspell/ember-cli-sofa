import Ember from 'ember';
import InternalModel, { getInternalModel } from '../../internal-model';
import Model from '../../model';
import Error from '../../util/error';
import { assert } from '../../util/assert';

const {
  get
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

  //

  dirty(changed) {
    this.relationship.dirty(this.internal, changed);
  }

  propertyDidChange(changed) {
    changed(this.relationship.name);
  }

  withPropertyChanges(cb) {
    return this.internal.withPropertyChanges(cb, true);
  }

  //

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

  deserializeDocIdToInternalModel(obj) {
    let relationshipModelClass = this.relationshipModelClass;
    let modelClass;
    let docId;
    if(this.relationship.opts.polymorphic) {
      docId = obj.id;
      modelClass = this.relationship.modelClassForName(obj.type);
      let definition = this.relationship.store._definitionForModelClass(modelClass);
      assert({
        error: 'invalid_document',
        reason: `document '${docId} is expected to be ${get(relationshipModelClass, 'modelName')} not ${definition.modelName}`
      }, definition.is(modelClass));
    } else {
      docId = obj;
      modelClass = relationshipModelClass;
    }
    let internal = this.relationshipDatabase._deserializeDocIdToInternalModel(modelClass, docId);
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
    if(!docId) {
      return null;
    }
    if(this.relationship.opts.polymorphic) {
      return {
        id: docId,
        type: internal.modelName
      };
    }
    return docId;
  }

  toInternalModel(object) {
    if(object instanceof InternalModel) {
      return object;
    }
    if(Ember.ObjectProxy.detectInstance(object)) {
      object = object.get('content');
    }
    Ember.assert(`ObjectProxy.content is ObjectProxy`, !Ember.ObjectProxy.detectInstance(object));
    if(Model.detectInstance(object)) {
      return getInternalModel(object);
    }
    return null;
  }

  onInternalDestroyed() {
    this.internal.removeObserver(this);
    this.destroyed = true;
  }

}

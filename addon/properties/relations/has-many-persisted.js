import Ember from 'ember';
import HasManyRelation from './has-many';

export default class HasManyPersistedRelation extends HasManyRelation {

  createArrayProxy(owner, content) {
    let _relation = this;
    return owner.lookup('sofa:has-many-persisted').create({ _relation, content });
  }

  serialize() {
    let content = this.content;
    return Ember.A(content.map(internal => {
      return this.serializeInternalModelToDocId(internal);
    })).compact();
  }

  deserialize(value, changed) {
    let internals = Ember.A(value).map(docId => this.deserializeDocIdToInternalModel(docId));
    this.setValue(internals, changed);
  }


}

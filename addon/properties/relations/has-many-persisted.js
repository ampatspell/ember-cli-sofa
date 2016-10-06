import Ember from 'ember';
import HasManyRelation from './has-many';
import HasManyContentLoader from './util/has-many-content-loader';

export default class HasManyPersistedRelation extends HasManyRelation {

  constructor() {
    super(...arguments);
    this.loader = new HasManyContentLoader(this);
  }

  createArrayProxy(owner, content) {
    let _relation = this;
    return owner.lookup('sofa:has-many-persisted').create({ _relation, content });
  }

  didAddInternalModel() {
    super.didAddInternalModel(...arguments);
    this.loader.setNeedsLoad();
  }

  modelFromInternalModel(internal) {
    if(internal) {
      this.loader.load();
    }
    return super.modelFromInternalModel(internal);
  }

  serialize(preview) {
    let content = this.content;
    return Ember.A(content.map(internal => {
      return this.serializeInternalModelToDocId(internal, preview);
    })).compact();
  }

  deserialize(value, changed) {
    let internals = Ember.A(Ember.A(value).map(docId => this.deserializeDocIdToInternalModel(docId))).compact();
    this.setValue(internals, changed);
  }


}

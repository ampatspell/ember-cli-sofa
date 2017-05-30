import HasManyRelation from './has-many';
import HasManyContentLoader from './util/has-many-content-loader';

export default class HasManyPersistedRelation extends HasManyRelation {

  constructor() {
    super(...arguments);
    this.loader = new HasManyContentLoader(this);
  }

  createArrayProxy(owner, content) {
    let _relation = this;
    return owner.factoryFor('sofa:has-many-persisted').create({ _relation, content });
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

  serialize(type) {
    return this.serializeInternalModelsToDocIds(this.getContent(), type);
  }

  deserialize(value, changed) {
    let internals = this.deserializeDocIdsToModels(value);
    this.setValue(internals, changed);
  }

}

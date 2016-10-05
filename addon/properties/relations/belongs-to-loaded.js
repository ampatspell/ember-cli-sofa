import BelongsToProxiedRelation from './belongs-to-proxied';

export default class BelongsToLoadedRelation extends BelongsToProxiedRelation {

  createObjectProxy(owner) {
    let _relation = this;
    return owner.lookup('sofa:belongs-to-loaded').create({ _relation });
  }

  createLoadInternalModelPromise() {
    // TODO: replace with Query
    let id = this.relationship.opts.query;
    let modelName = this.relationship.opts.relationshipModelName;
    let database = this.internal.database;
    return database._internalModelFirst({ model: modelName, id }).then(internal => {
      return internal;
    });
  }

  createLoadPromise() {
    return this.createLoadInternalModelPromise().then(internal => {
      this.withPropertyChanges(changed => {
        this.setContent(internal, changed);
      });
      return this.getValue();
    });
  }

  getLoadPromise() {
    let promise = this.loadPromise;
    if(!promise) {
      promise = this.createLoadPromise().finally(() => {
        this.loadPromise = null;
      });
      this.loadPromise = promise;
    }
    return promise;
  }

  serialize() {
  }

  deserialize(value, changed) {
  }

}

export default class InternalCollection {

  constructor(database, collectionClass, opts) {
    this.database = database;
    this.collectionClass = collectionClass;
    this.opts = opts;
    this.collectionModel = null;
  }

  createCollectionModel() {
    return this.collectionClass.create({ _internal: this });
  }

  getCollectionModel() {
    let model = this.collectionModel;
    if(!model) {
      model = this.createCollectionModel();
      this.collectionModel = model;
    }
    return model;
  }

}

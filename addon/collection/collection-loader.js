import QueryLoader from '../util/query-loader';

export default class CollectionLoader extends QueryLoader {

  constructor(internalCollection) {
    super();
    this.internalCollection = internalCollection;
  }

  getProxy() {
    return this.internalCollection.collectionModel;
  }

  getQuery() {
    return this.internalCollection.getQuery();
  }

  didLoad(results) {
    this.internalCollection.collectionLoaderDidLoad(results);
  }

}

import QueryLoader from '../../../util/query-loader';

export default class RelationLoader extends QueryLoader {

  constructor(relation) {
    super();
    this.relation = relation;
  }

  getProxy() {
    return this.relation.value;
  }

  getQuery() {
    return this.relation.getQuery();
  }

  didLoad(result) {
    this.relation.relationLoaderDidLoad(result);
  }

}

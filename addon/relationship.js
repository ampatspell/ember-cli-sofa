import Ember from 'ember';

const {
  Mixin,
  merge
} = Ember;

class RelationshipBuilder {

  constructor(properties) {
    this.properties = properties;
  }

  extend(properties) {
    let merged = {};
    merge(merged, this.properties);
    merge(merged, properties);
    return new this.constructor(merged);
  }

  build() {
    return Mixin.create(this.properties);
  }

}

export default new RelationshipBuilder();

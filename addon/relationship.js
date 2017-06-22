import Ember from 'ember';

const {
  Mixin,
  merge
} = Ember;

class RelationshipBuilder {

  constructor(properties) {
    this.properties = properties;
    this.mixin;
  }

  extend(properties) {
    let merged = {};
    merge(merged, this.properties);
    merge(merged, properties);
    return new this.constructor(merged);
  }

  build() {
    if(!this.mixin) {
      this.mixin = Mixin.create(this.properties);
    }
    return this.mixin;
  }

}

export default new RelationshipBuilder();

import Ember from 'ember';

const {
  Mixin,
  merge
} = Ember;

class RelationshipBuilder {

  constructor(properties) {
    this.properties = properties;
    this.mixin = null;
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

  isLoaded() {
    return !!this.properties.query;
  }

}

export default new RelationshipBuilder();

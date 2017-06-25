import Ember from 'ember';

const {
  A
} = Ember;

function properties(builder) {
  let array = A();
  while(builder) {
    if(builder.properties) {
      array.push(builder.properties);
    }
    builder = builder.parent;
  }
  return array.reverse();
}

class RelationshipBuilder {

  constructor(parent, properties) {
    this.parent = parent;
    this.properties = properties;
  }

  extend(properties) {
    return new this.constructor(this, properties);
  }

  build(Proxy) {
    let array = properties(this);
    for(let i = 0; i < array.length; i++) {
      let hash = array[i];
      Proxy = Proxy.extend(hash);
    }
    return Proxy;
  }

  isLoaded() {
    return !!this.properties.query;
  }

}

export default new RelationshipBuilder();

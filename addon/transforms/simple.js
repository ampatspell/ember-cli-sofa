import Transform from './transform';

export default class SimpleTransform extends Transform {

  transform(/* value, opts */) {
  }

  toModel(value, property) {
    return this.transform(value, property.opts);
  }

  toDocument(value, property) {
    return this.transform(value, property.opts);
  }

}

import Transform from './transform';

export default class NoopTransform extends Transform {

  toModel(value) {
    return value;
  }

}

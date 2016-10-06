import createTransform from './array-transform-mixin';

export default createTransform({
  internal(model) {
    return this._relation.internalModelFromModel(model);
  },
  public(internal) {
    return this._relation.modelFromInternalModel(internal);
  }
});

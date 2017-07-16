import Ember from 'ember';
import { configurations } from '../helpers/setup';
import transform from 'sofa/util/array-transform-mixin';

const {
  A
} = Ember;

configurations({ only: '1.6' }, ({ module, test }) => {

  let Transform = transform({
    public(hash) {
      return hash.value;
    },
    internal(value) {
      return { value };
    }
  });

  let TransformingArray = Ember.ArrayProxy.extend(Transform);
  let array;

  module('array-transform', () => {
    array = TransformingArray.create({ content: A() });
  });

  test('foof', assert => {
    let a = 'a';
    assert.ok(array.pushObject(a) === a);

    let bc = [ 'b', 'c' ];
    assert.ok(array.pushObjects(bc) === array);

    assert.ok(array.objectAt(0) === 'a');

    assert.deepEqual(array.get('content'), [
      { "value": "a" },
      { "value": "b" },
      { "value": "c" }
    ]);
  });

});

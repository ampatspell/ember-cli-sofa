import Ember from 'ember';

const {
  assert,
  A
} = Ember;

export default (array, size) => {
  assert(`size must be more than zero`, size > 0);
  let result = A();
  for(let i = 0; i < array.length; i += size) {
    result.push(A(array.slice(i, i + size)));
  }
  return result;
};

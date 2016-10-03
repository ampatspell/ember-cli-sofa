import Ember from 'ember';

export default Ember.Helper.helper(function(params, hash) {
  let arr = [];
  for(let i = 0; i < params.length; i++) {
    if(params[i]) {
      arr.push(params[i]);
    }
  }
  let delimiter = hash.delimiter || '';
  return arr.join(delimiter);
});

import Ember from 'ember';

const {
  A,
  RSVP: { all }
} = Ember;

const objectValuesToArray = obj => {
  let arr = A();
  for(let key in obj) {
    arr.push(obj[key]);
  }
  return arr;
};

export default Ember.Mixin.create({

  wait() {
    let couches = objectValuesToArray(this.get('_couches.openCouches')).mapBy('operations');
    let databases = objectValuesToArray(this.get('_databases')).mapBy('operations');
    let operations = [ ...couches, ...databases ];
    return all(operations.map(op => op.wait()));
  }

});

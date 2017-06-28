import Ember from 'ember';

const {
  computed
} = Ember;

const relation = cb => {
  return computed(function() {
    return cb(this._relation);
  }).readOnly();
}

const property = key => {
  return relation(relation => relation[key]);
}

export default Ember.Mixin.create({

  model:    property('parentModel'),
  name:     property('relationshipPropertyName'),
  database: property('relationshipDatabase'),
  store:    property('store'),

});

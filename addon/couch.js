import Ember from 'ember';

const {
  getOwner,
  computed,
  computed: { oneWay }
} = Ember;

const session = function() {
  return computed(function() {
    let owner = getOwner(this);
    let Session = owner.factoryFor('sofa/session:main') || owner.factoryFor('sofa:session');
    return Session.create({ couch: this });
  }).readOnly();
};

export default Ember.Object.extend({

  documents: null,

  url: oneWay('documents.url'),

  session: session()

});

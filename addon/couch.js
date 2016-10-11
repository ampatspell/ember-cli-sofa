import Ember from 'ember';

const {
  getOwner,
  computed,
  computed: { oneWay }
} = Ember;

const session = function() {
  return computed(function() {
    let owner = getOwner(this);
    let Session = owner.lookup('sofa/session:main') || owner.lookup('sofa:session');
    return Session.create({ couch: this });
  }).readOnly();
};

export default Ember.Object.extend({

  documents: null,

  url: oneWay('documents.url'),

  session: session()

});

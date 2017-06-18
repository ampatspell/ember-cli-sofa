import Ember from 'ember';

const {
  getOwner,
  computed
} = Ember;

const session = () => {
  return computed(function() {
    let owner = getOwner(this);
    let Session = owner.factoryFor('sofa/session:main') || owner.factoryFor('sofa:session');
    return Session.create({ couch: this });
  }).readOnly();
}

export default Ember.Mixin.create({

  session: session()

});

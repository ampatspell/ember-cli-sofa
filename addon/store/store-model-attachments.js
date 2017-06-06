import Ember from 'ember';

const {
  getOwner
} = Ember;

export default Ember.Mixin.create({

  _lookupAttachmentContentClass(database, name) {
    let owner = getOwner(this);
    let Class;
    if(database) {
      let identifier = database.get('identifier');
      Class = owner.factoryFor(`sofa/database:${identifier}/attachment/content/${name}`);
    }
    if(!Class) {
      Class = owner.factoryFor(`sofa:attachment-content/${name}`);
    }
    return Class;
  },

});

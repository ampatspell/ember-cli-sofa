import Ember from 'ember';

const {
  getOwner
} = Ember;

const lookup = (owner, database, custom, fallback) => {
  owner = getOwner(owner);
  let Class;
  if(database) {
    let identifier = database.get('identifier');
    Class = owner.factoryFor(custom(identifier));
  }
  if(!Class) {
    Class = owner.factoryFor(fallback);
  }
  return Class;
};

export default Ember.Mixin.create({

  _lookupAttachmentContentClass(database, name) {
    return lookup(
      this,
      database,
      identifier => `sofa/database:${identifier}/attachment/${name}`,
      `sofa:attachment-content/${name}`
    );
  },

  _lookupAttachmentClass(database) {
    return lookup(
      this,
      database,
      identifier => `sofa/database:${identifier}/attachment`,
      'sofa:attachment'
    );
  },

  _lookupAttachmentsClass(database) {
    return lookup(
      this,
      database,
      identifier => `sofa/database:${identifier}/attachments`,
      'sofa:attachments'
    );
  }

});

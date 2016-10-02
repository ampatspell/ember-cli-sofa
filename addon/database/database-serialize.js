import Ember from 'ember';

export default Ember.Mixin.create({

  _serializeInternalModelToDocument(internal, preview=false) {
    let definition = internal.definition;
    return definition.serialize(internal, preview);
  }

});

import Ember from 'ember';

export default Ember.Mixin.create({

  _serializeInternalModelToDocument(internal, type) {
    let definition = internal.definition;
    definition.willSerialize(internal, type);
    return definition.serialize(internal, type);
  }

});

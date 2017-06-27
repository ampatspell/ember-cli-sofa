import Ember from 'ember';

const {
  merge
} = Ember;

export default Ember.Mixin.create({

  _createChangesForInternalChanges(internal) {
    let Changes = internal.changesClass;
    return Changes.create(merge({ _internal: internal }, internal.opts));
  }

});

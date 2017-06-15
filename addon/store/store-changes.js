import Ember from 'ember';
import create from '../util/create';

const {
  merge
} = Ember;

export default Ember.Mixin.create({

  _createChangesForInternalChanges(internal) {
    let changesClass = internal.changesClass;
    return create(changesClass, merge({ _internal: internal }, internal.opts));
  }

});

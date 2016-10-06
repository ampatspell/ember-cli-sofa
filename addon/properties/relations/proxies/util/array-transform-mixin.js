import Ember from 'ember';

const {
  get
} = Ember;

export default function(hash) {
  return Ember.Mixin.create({

    objectAtContent(idx) {
      let object = get(this, 'arrangedContent').objectAt(idx);
      return hash.public.call(this, object);
    },

    replaceContent(idx, amt, objects) {
      objects = Ember.A(objects).map(object => {
        return hash.internal.call(this, object);
      });
      this._super(idx, amt, objects);
    }

  });
}

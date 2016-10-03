import Ember from 'ember';
import transform from 'sofa/properties/relations/proxies/array-transform-mixin';

const {
  computed
} = Ember;

let Transform = transform({
  internal(obj) {
    let props = obj.getProperties('name', 'isNice');
    return { props, obj };
  },
  public(hash) {
    return hash.obj;
  }
});

let TransformingArray = Ember.ArrayProxy.extend(Transform);

export default Ember.Component.extend({

  array: computed(function() {
    let arr = TransformingArray.create({ content: Ember.A() });
    window.arr = arr;
    window.add = (name, isNice) => {
      arr.pushObject(Ember.Object.create({ name, isNice }));
    };
    return arr;
  }),

  nice: computed('array.@each.isNice', function() {
    return this.get('array').filter(value => {
      return value.get('isNice');
    });
  }),

});

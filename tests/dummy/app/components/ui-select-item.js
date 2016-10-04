import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [':ui-select-item'],

  checked: computed('selected.[]', 'item', function() {
    let array = this.get('selected');
    if(!array) {
      return;
    }
    let item = this.get('item');
    return array.includes(item);
  }),

  actions: {
    change() {
      let checked = this.get('checked');
      this.attrs.toggle(!checked);
    }
  }

});

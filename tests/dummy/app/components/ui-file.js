import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: [':ui-file'],

  tagName: 'input',
  attributeBindings: ['type', 'multiple'],
  type: 'file',
  multiple: false,

  change() {
    var el = this.get('element');
    var files = el.files;
    if(files.length > 0 && this.attrs.action) {
      var array = Ember.A();
      for(var i = 0, len = files.length; i < len; i++) {
        array.push(files[i]);
      }
      if(this.get('multiple')) {
        this.attrs.action(array);
      } else {
        this.attrs.action(array[0]);
      }
    }
    // el.value = '';
  }

});

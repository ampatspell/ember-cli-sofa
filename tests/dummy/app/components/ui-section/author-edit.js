import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: [':ui-section', ':authors-edit'],

  actions: {
    updateBlogSelection(blog, select) {
      if(select) {
        this.get('author.blogs').pushObject(blog);
      } else {
        this.get('author.blogs').removeObject(blog);
      }
    }
  }
});

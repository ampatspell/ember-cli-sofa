import Ember from 'ember';
import Base from './ui-model';

const {
  computed
} = Ember;

export default Base.extend({
  classNameBindings: [':blog'],

  authors: computed('models.@each.modelName', function() {
    return Ember.A(this.get('models')).filterBy('modelName', 'author');
  }),

  actions: {
    selectAuthor(author) {
      this.get('model').set('author', author);
    }
  }

});

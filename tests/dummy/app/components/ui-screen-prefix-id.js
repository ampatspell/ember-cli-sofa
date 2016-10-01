import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [':ui-screen-prefix-id', ':block'],
  layout: hbs`
    <div>{{model}}</div>
    {{ui-input title='id' value=model.id}}
    <div>
      isNew: {{model.isNew}}
      {{ui-button title='true' action=(action 'setNew' true)}}
      {{ui-button title='false' action=(action 'setNew' false)}}
    </div>
  `,

  model: computed(function() {
    return this.get('store.db.main').model('author', {
      id: 'ampatspell',
      name: 'ampatspell',
      email: 'ampatspell@gmail.com'
    });
  }),

  actions: {
    setNew(value) {
      console.log('setNew');
      this.get('model._internal').setState({ isNew: value }, true);
    }
  }

});

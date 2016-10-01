import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [':ui-screen-prefix-id', ':block'],
  layout: hbs`
    {{#ui-block title='model'}}
      {{model}}
    {{/ui-block}}
    {{ui-input title='id' value=model.id}}

    {{#ui-block title='state'}}
      {{ui-json value=model.state}}
    {{/ui-block}}

    {{#ui-block title='serialized'}}
      {{ui-json value=serialized}}
      {{ui-button title='serialize' action=(action 'serialize')}}
    {{/ui-block}}

    {{#ui-block title='isNew'}}
      {{model.isNew}}
      {{ui-button title='true' action=(action 'setNew' true)}}
      {{ui-button title='false' action=(action 'setNew' false)}}
    {{/ui-block}}

    {{#ui-block title='isDirty'}}
      {{model.isDirty}}
      {{ui-button title='true' action=(action 'setDirty' true)}}
      {{ui-button title='false' action=(action 'setDirty' false)}}
    {{/ui-block}}
  `,

  model: computed(function() {
    return this.get('store.db.main').model('author', {
      id: 'ampatspell',
      name: 'ampatspell',
      email: 'ampatspell@gmail.com'
    });
  }),

  serialized: null,

  actions: {
    serialize() {
      this.set('serialized', this.get('model').serialize());
    },
    setNew(value) {
      this.get('model._internal').setState({ isNew: value }, true);
    },
    setDirty(value) {
      this.get('model._internal').setState({ isDirty: value }, true);
    }
  }

});

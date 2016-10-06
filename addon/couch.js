import Ember from 'ember';

const {
  computed: { oneWay }
} = Ember;

export default Ember.Object.extend({

  documents: null,

  url: oneWay('documents.url'),

});

import Ember from 'ember';
import { lookup } from './util/computed';

const {
  computed: { oneWay }
} = Ember;

const session = function() {
  return lookup('sofa:session', function() {
    return { couch: this };
  });
}

export default Ember.Object.extend({

  documents: null,

  url: oneWay('documents.url'),

  session: session(),

});

define('sofa/promise', [ 'ember' ], function() {
  'use strict';

  var Promise = Ember.RSVP;
  window.Promise = Promise;

  return {
    'default': Promise
  };
});

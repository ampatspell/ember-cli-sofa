(function() {
  /* globals define, blobUtil */
  function generateModule(name, values) {
    define(name, [], function() {
      'use strict';
      return values;
    });
  }

  generateModule('sofa/blob-util', { 'default': blobUtil });
})();

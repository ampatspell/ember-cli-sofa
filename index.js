/* jshint node: true */
'use strict';

module.exports = {
  name: 'sofa',
  included: function(app) {
    app.import('vendor/ember-cli-sofa/promise.js', { type: 'vendor' });
    app.import(app.bowerDirectory + '/blob-util/dist/blob-util.js');
    app.import('vendor/ember-cli-sofa/blob-util.js', {
      exports: {
        'blob-util': [ 'default' ]
      }
    });
  },
  isDevelopingAddon: function() {
    return true;
  }
};

/* jshint node: true */
'use strict';

module.exports = {
  name: 'sofa',
  included: function(app) {
    this._super.included(app);
    app.import('vendor/ember-cli-sofa/promise.js', { type: 'vendor' });
  },
  isDevelopingAddon: function() {
    return true;
  }
};

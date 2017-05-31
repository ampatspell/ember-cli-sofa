var RSVP = require('rsvp');

module.exports = {
  normalizeEntityName: function() {
  },
  afterInstall: function() {
    return RSVP.all([
      this.addPackageToProject('blob-util'),
      this.addAddonToProject('ember-browserify'),
      this.addAddonToProject({ name: 'ember-network', target: '^0.3.0' })
    ]);
  }
};

module.exports = {
  normalizeEntityName: function() {
  },
  afterInstall: function() {
    return this.addAddonToProject('ember-cli-couch', '1.0.2')
  }
};

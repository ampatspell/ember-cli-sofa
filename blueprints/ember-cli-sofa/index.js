module.exports = {
  normalizeEntityName: function() {
  },
  afterInstall: function() {
    return this.addAddonToProject('ember-cli-couch', '0.0.11')
  }
};

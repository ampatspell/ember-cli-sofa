module.exports = {
  normalizeEntityName: function() {
  },
  afterInstall: function() {
    return this.addBowerPackageToProject('blob-util').then(() => {
      return this.addAddonToProject({ name: 'ember-network', target: '^0.3.0' });
    });
  }
};

/*jshint node:true*/
'use strict';

let pkg = require('../package');

module.exports = function(/* environment, appConfig */) {
  return {
    sofa: {
      name: pkg.name,
      version: pkg.version
    }
  };
};

module.exports = function() {

  var data = require('gulp-data');
  var _ = require('lodash');
  var Promise = require('bluebird');
  var read = Promise.promisify(require('fs').readFile);
  var marked = Promise.promisify(require('marked'));

  var version = require('../../package.json').version;

  function postprocess(string) {
    string = string.replace(/{{version}}/g, version);
    return marked(string).then(function(markdown) {
      markdown = markdown.replace(/lang-(\w+)/g, "lang-$1 hljs $1");
      return markdown;
    });
  }

  function loadFiles(files, opts)  {
    opts = opts || {};
    return Promise.all(_.map(files, function(filename, key) {
      return read(filename, 'utf-8').then(function(string) {
        return postprocess(string);
      }).then(function(result) {
        opts[key] = result;
      });
    })).then(function() {
      return opts;
    });
  }

  return function(load, opts) {
    var promise;
    return data(function(file, cb) {
      promise = promise || loadFiles(load, opts);
      promise.then(function(opts) {
        cb(undefined, opts);
      }, function(err) {
        cb(err);
      })
    });
  };
}();

module.exports = function(Handlebars) {

  var Helpers = Object.create(null);

  Helpers.log = function(arg) {
    console.log(arg);
  }

  return Helpers;
};

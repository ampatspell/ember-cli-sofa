module.exports = app => {

  let request = require('request');

  app.use('/api', (req, res, next) => {
    var base = 'http://127.0.0.1:5984';
    var target = `${base}${req.url}`;
    req.pipe(request(target).on('error', err => {
      var error = new Error("proxy");
      error.method = req.method;
      error.url = target;
      error.reason = err.message;
      next(error);
    })).pipe(res);
  });

  let stack = app._router.stack;
  let m = stack.pop();
  stack.unshift(m);

};

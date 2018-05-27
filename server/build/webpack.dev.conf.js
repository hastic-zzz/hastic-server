var base = require('./webpack.base.conf');

base.watch = true;

base.externals = [
  function(context, request, callback) {
    if(request[0] == '.') {
      callback();
    } else {
      callback(null, "require('" + request + "')");
    }
  }
]
module.exports = base;
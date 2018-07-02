var path = require('path');

// based on: https://github.com/webpack-contrib/node-loader/blob/master/index.js
module.exports = function nodeLoader(m, q) {
  return (`
    var modulePath = __dirname + '/${path.basename(this.resourcePath)}';
    try {
      global.process.dlopen(module, modulePath); 
    } catch(e) {
      throw new Error('dlopen: Cannot open ' + modulePath + ': ' + e);
    }
  `);
}
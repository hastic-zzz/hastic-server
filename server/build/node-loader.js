const utils = require('./utils');

const path = require('path');


const PLATFORM = utils.getPlatform();

// based on: https://github.com/webpack-contrib/node-loader/blob/master/index.js
module.exports = function nodeLoader(m, q) {
  
  const DEFAULT_MODULE_PATH = `__dirname + '/${path.basename(this.resourcePath)}'`;
  const DEASYNC_MODULE_PATH = `__dirname + '/bin/${PLATFORM}/deasync.node'`;

  const isDeasync = this.resourcePath.indexOf('deasync') >= 0;
  return (`
    var modulePath = ${isDeasync ? DEASYNC_MODULE_PATH : DEFAULT_MODULE_PATH};
    try {
      global.process.dlopen(module, modulePath); 
    } catch(e) {
      console.error('dlopen: Cannot open ' + modulePath + ': ' + e);
      throw new Error('dlopen: Cannot open ' + modulePath + ': ' + e);
    }
  `);
}

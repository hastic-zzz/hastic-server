const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

var base = require('./webpack.base.conf');

const nodeVersion = 'node-' + /[0-9]+/.exec(process.versions.node)[0];
const PLATFORM = `${process.platform}-${process.arch}-${nodeVersion}`;

const DEASYNC_NODE_MODULES_PATH = path.resolve(
  'node_modules',
  'deasync',
  'bin',
  PLATFORM
);

const DEASYNC_DIST_PATH = path.resolve('dist', 'bin', PLATFORM);

if(!fs.existsSync(DEASYNC_NODE_MODULES_PATH)) {
  throw new Error(`deasync doesn't support this platform: ${PLATFORM}`);
}

base.mode = 'production';
base.output.filename = "server.js";
// base.optimization.minimize = true;  UNCOMMENT IT!

base.externals = base.externals ? base.externals : [];
base.externals.push(
  function (context, request, callback) {
    if(request.indexOf('bindings') === 0) {
      callback(null, `() => require('./deasync.node')`)
    } else {
      callback();
    }
  }
);

const prodRules = [
  {
    test: /\.js$/,
    use: {
      loader: 'babel-loader'
    }
  },
  {
    test: /\.node$/,
    use: [
      { loader: './build/node-loader' },
      { loader: 'file-loader', options: { name: '[name].[ext]' } }
    ]
  }
];

let contextPathMapping = {};
contextPathMapping[path.resolve(DEASYNC_DIST_PATH, 'deasync')] = './deasync.node';

const prodPlugins = [
  new webpack.ContextReplacementPlugin(
    /deasync/,
    DEASYNC_NODE_MODULES_PATH,
    contextPathMapping
  )
];

base.module.rules = [...base.module.rules, ...prodRules];
base.plugins = [...base.plugins, ...prodPlugins];

module.exports = base;

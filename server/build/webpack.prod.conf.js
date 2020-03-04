const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

var base = require('./webpack.base.conf');

const TARGET_NODE_VERSION = process.versions.node;
const PLATFORM = `${process.platform}-${process.arch}-node-${TARGET_NODE_VERSION.split('.')[0]}`;
const DEASYNC_NODE_MODULES_PATH = path.resolve('node_modules', 'deasync', 'bin', PLATFORM);
const DEASYNC_DIST_PATH = path.resolve('dist', 'bin', PLATFORM);

console.log(`Target node version: ${TARGET_NODE_VERSION}`);
console.log(`Platform: ${PLATFORM}`);

if(!fs.existsSync(DEASYNC_NODE_MODULES_PATH)) {
  throw new Error(`deasync doesn't support this platform: ${PLATFORM}`);
}

base.mode = 'production';
base.output.filename = "server.js";
base.optimization.minimize = true;

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
      loader: 'babel-loader',
      options: {
        plugins: ["transform-object-rest-spread"], // for transpiling "ws" lib
        presets: [
          ["env", { "targets": { "node": TARGET_NODE_VERSION }}]
        ]
      }
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

const utils = require('./utils');

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

var base = require('./webpack.base.conf');


const PLATFORM = utils.getPlatform();

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

const prodRules = [
  {
    test: /zmq\.node$/,
    use: [
      { loader: './build/node-loader' },
      { loader: 'file-loader', options: { name: '[name].[ext]' } }
    ]
  },
  // deasync is trying to find dist/bin/<platform>/deasync.node in runtime
  // so we change default outputPath
  {
    test: /deasync\.node$/,
    use: [
      { loader: './build/node-loader' },
      {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: path.join('bin', PLATFORM)
        }
      }
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


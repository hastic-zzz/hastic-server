const CopyWebpackPlugin = require('copy-webpack-plugin')

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

var base = require('./webpack.base.conf');


const NODE_VERSION = 'node-' + /[0-9]+/.exec(process.versions.node)[0];
const PLATFORM = process.platform + '-' + process.arch + '-' + NODE_VERSION;

const DEASYNC_NODE_MODULES_PATH = path.join(
  path.resolve('node_modules'),
  'deasync',
  'bin',
  PLATFORM
);

if(!fs.existsSync(DEASYNC_NODE_MODULES_PATH)) {
  throw new Error(`deasync doesn't support this platform: ${PLATFORM}`);
}

base.mode = 'production';

base.module.rules.push({
  test: /\.node$/,
  use: [
    { loader: './build/node-loader' },
    { loader: 'file-loader', options: { name: '[name].[ext]' } },
  ]
});

base.plugins.push(
  new CopyWebpackPlugin([
    { from: `${DEASYNC_NODE_MODULES_PATH}/deasync.node`, to: `bin/${PLATFORM}/deasync.node` }
  ])
);

let pathMapping = {};
pathMapping[`${DEASYNC_NODE_MODULES_PATH}/deasync`] = './deasync.node';

base.plugins.push(new webpack.ContextReplacementPlugin(
  /deasync/,
  DEASYNC_NODE_MODULES_PATH,
  pathMapping
));

module.exports = base;


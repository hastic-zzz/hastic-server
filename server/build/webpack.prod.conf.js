const EventHooksPlugin = require('event-hooks-webpack-plugin');

const webpack = require('webpack');
const path = require('path');
// fs-extra is used to create directory recursively
// fs supports it only since node v10.x
const fs = require('fs-extra');

var base = require('./webpack.base.conf');


const NODE_VERSION = 'node-' + /[0-9]+/.exec(process.versions.node)[0];
const PLATFORM = process.platform + '-' + process.arch + '-' + NODE_VERSION;
const DEASYNC_DIST_PATH = path.join(
  path.resolve(`dist`),
  'bin',
  PLATFORM
);
const DEASYNC_NODE_MODULES_PATH = path.join(
  path.resolve('node_modules'),
  'deasync',
  'bin',
  PLATFORM
);

base.mode = 'production';

base.module.rules.push({
  test: /\.node$/,
  use: [
    { loader: './build/node-loader' },
    { loader: 'file-loader', options: { name: '[name].[ext]' } },
  ]
});

base.plugins.push(
  new EventHooksPlugin({
    beforeRun: () => {
      const isPlatformSupported = fs.existsSync(DEASYNC_NODE_MODULES_PATH);
      if(!isPlatformSupported) {
        throw new Error(`deasync doesn't support this platform: ${PLATFORM}`);
      }

      console.log('Copying deasync.node from node_modules to dist/bin...');

      // Create dist/bin/<platform> if it doesn't exist
      fs.ensureDirSync(DEASYNC_DIST_PATH);

      fs.copySync(
        path.join(DEASYNC_NODE_MODULES_PATH, 'deasync.node'),
        path.join(DEASYNC_DIST_PATH, 'deasync.node')
      );
    }
  })
);

const deasyncBinFileName = path.join(DEASYNC_DIST_PATH, 'deasync');

let pathMapping = {};
pathMapping[deasyncBinFileName] = './deasync.node';

base.plugins.push(new webpack.ContextReplacementPlugin(
  /deasync/,
  DEASYNC_DIST_PATH,
  pathMapping
));

module.exports = base;


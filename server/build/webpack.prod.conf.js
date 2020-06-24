const semver = require('semver');

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

var base = require('./webpack.base.conf');

const TARGET_NODE_VERSION = process.versions.node;

base.mode = 'production';
base.output.filename = "server.js";
base.optimization.minimize = true;

const prodRules = [
  {
    test: /\.js$/,
    use: {
      loader: 'babel-loader',
      options: {
        plugins: ["transform-object-rest-spread"], // for transpiling "ws" lib
                                                   // it's necessare only for node < 8.3.0, 
                                                   // so could be optimized
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

base.module.rules = [...base.module.rules, ...prodRules];

module.exports = base;

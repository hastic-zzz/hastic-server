const path = require('path');
const fs = require('fs');

const webpack = require('webpack');


function resolve(p) {
  return path.resolve(__dirname, './../', p);
}

module.exports = {
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  entry: [ 'babel-polyfill', './src/index.ts' ],
  output: {
    filename: "server-dev.js",
    path: resolve('dist')
  },
  optimization: {
    minimize: false
  },
  plugins: [
  ],
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      'any-promise': 'es6-promise'
    }
  },
  stats: {
    warningsFilter: [
      'mongodb-client-encryption',
      'saslprep',
      /require_optional/
    ]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          { loader: 'babel-loader' },
          { loader: 'ts-loader' }
        ]
      }
    ]
  }
}

const path = require('path');
const fs = require('fs');

const webpack = require('webpack');


function resolve(p) {
  return path.join(__dirname, '/../', p);
}

module.exports = {
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  context: resolve('./src'),
  entry: './index',
  output: {
    filename: "server.js",
    path: resolve('dist')
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin()
  ],
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      'any-promise': 'es6-promise'
    }
  },
  module: {
    loaders: [
      {
        test: /\.ts?$/,
        loaders: ['babel-loader', 'ts-loader'],
        exclude: [ /node_modules/ ]
      },
      // babel-loader for pure javascript (es6) => javascript (es5)
      {
        test: /\.(jsx?)$/,
        loaders: ['babel'],
        exclude: [ /node_modules/ ]
      }
    ]
  }
}

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
  entry: ["babel-polyfill", './index'],
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
    rules: [{
      test: /\.ts$/,
      use: [
        { 
          loader: 'babel-loader',
          options: {
            plugins: ['transform-async-generator-functions'],
            babelrc: false
          }
          
        },
        { loader: 'ts-loader' }
      ]
    }]
  }
}

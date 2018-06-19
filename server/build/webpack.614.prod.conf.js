const path = require('path');
const fs = require('fs');

const webpack = require('webpack');


module.exports = {
  mode: 'production',
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  entry: [ 'babel-polyfill', './dist/server.js' ],
  output: {
    filename: "server-6-14.js",
    path: path.join(__dirname, '../dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          { loader: 'babel-loader' }
        ]
      }
    ]
  }
}

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
  entry: [ 'babel-polyfill', './dist/server-dev.js' ],
  output: {
    filename: "server.js",
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

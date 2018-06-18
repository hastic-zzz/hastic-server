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
  entry: [ './src/index.ts' ],
  output: {
    filename: "server.js",
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

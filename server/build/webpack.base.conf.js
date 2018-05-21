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
  devtool: 'inline-source-map',
  output: {
    filename: "server.js",
    path: resolve('dist')
  },
  externals: [
    function(context, request, callback) {
      if(request[0] == '.') {
        callback();
      } else {
        callback(null, "require('" + request + "')");
      }
    }
  ],
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/
      }
    ]
  }
}

const webpack = require('webpack');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const gitRevisionPlugin = new GitRevisionPlugin();

const path = require('path');


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
    path: resolve('dist')
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new webpack.DefinePlugin({
      'GIT_VERSION': JSON.stringify(gitRevisionPlugin.version()),
      'GIT_COMMITHASH': JSON.stringify(gitRevisionPlugin.commithash()),
      'GIT_BRANCH': JSON.stringify(gitRevisionPlugin.branch()),
    })
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
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader'
        }
      },
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

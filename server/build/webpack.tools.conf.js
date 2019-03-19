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
  entry: [ 'babel-polyfill', './tools/migrate-to-0.3.2-beta.ts' ],
  output: {
    filename: "migrate-to-0.3.2-beta.js",
    path: resolve('dist-tools')
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

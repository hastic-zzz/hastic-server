const path = require('path');

module.exports = {
  mode: 'production',
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  entry: [ './dist/server-dev.js' ],
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

var base = require('./webpack.base.conf');

base.mode = 'production';
base.module.rules.push({
  test: /\.node$/,
  use: 'node-loader'
});

module.exports = base;


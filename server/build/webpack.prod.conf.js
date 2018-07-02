var base = require('./webpack.base.conf');


base.mode = 'production';

base.module.rules.push({
  test: /\.node$/,
  use: [
    { loader: './build/node-loader' },
    { loader: 'file-loader', options: { name: '[name].[ext]' } },
  ]
});

module.exports = base;


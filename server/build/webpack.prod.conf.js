var base = require('./webpack.base.conf');


base.mode = 'production';

base.node = { console: true };
base.debug = true;

base.module.rules.push({
  test: /\.node$/,
  use: [
    { loader: './build/node-loader' },
    { loader: 'file-loader', options: { name: '[name].[ext]' } },
  ]
});

module.exports = base;

const { spawn } = require('child_process');
const nodemon = require('nodemon');

const webpack = spawn('webpack', ['--config', 'build/webpack.dev.conf.js'], {
  stdio: 'inherit',
  shell: false
});

var env = Object.create(process.env);
env.LOG_LEVEL = 'debug';

nodemon({ env, script: 'dist/server-dev.js' })
  .on('start', function () {
    console.log('nodemon started');
  }).on('crash', function () {
    console.log('hastic-server crashed');
  });

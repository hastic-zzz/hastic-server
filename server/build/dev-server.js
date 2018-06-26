const { spawn } = require('child_process');

const webpack = spawn('webpack', ['--config', 'build/webpack.dev.conf.js'], {
  stdio: 'inherit',
  shell: false
});

var env = Object.create(process.env);
env.LOG_LEVEL = 'debug';

const nodemon = spawn(
  'nodemon',
  ['--exec', '"node --inspect dist/server-dev.js"'],
  { env: env, shell: true }
);


nodemon.stdout.pipe(process.stdout);
nodemon.stderr.pipe(process.stderr);

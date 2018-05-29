const { spawn } = require('child_process');

const webpack = spawn('webpack', ['--config', 'build/webpack.dev.conf.js'], {
  stdio: 'inherit',
  shell: true
});

const nodemon = spawn('nodemon', ['../dist/server', '--watch', 'server.js']);
nodemon.stdout.pipe(process.stdout);
nodemon.stderr.pipe(process.stderr);

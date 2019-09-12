function getPlatform() {
  const nodeVersion = 'node-' + /[0-9]+/.exec(process.versions.node)[0];
  return `${process.platform}-${process.arch}-${nodeVersion}`;
}

module.exports = { getPlatform };

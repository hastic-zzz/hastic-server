// we need this module because we can't avoid underscore lib usage in nedb
// missing `pluck` method added
var _ = require('lodash');
_.pluck = _.map;
module.exports = _;

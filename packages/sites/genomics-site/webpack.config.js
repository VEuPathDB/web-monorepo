// Enhance WDK's webpack config so we can share packages

var path = require('path');
var projectHome = process.env.PROJECT_HOME;
var wdkRoot = path.join(projectHome, 'WDK/View');

var config = require(path.join(wdkRoot, 'webpack.config'));

initializeProps(config, 'resolve.alias');
initializeProps(config, 'resolveLoader');

config.resolve.fallback = config.resolveLoader.fallback = path.join(wdkRoot, 'node_modules');
config.resolve.alias.wdk = path.join(wdkRoot, 'webapp/wdk/js');

module.exports = config;


// Make sure props are initialized to an empty object
// Ues '.' to define deep paths, e.g.: initializeProps(config, 'resolve.alias');
function initializeProps(target, path, value) {
  if (value === undefined) value = {};
  var props = path.split('.');
  var prop;
  while (prop = props.shift()) {
    if (target[prop] == null) {
      if (props.length === 0) target[prop] = value;
      else target[prop] = {};
    }
    target = target[prop];
  }
}

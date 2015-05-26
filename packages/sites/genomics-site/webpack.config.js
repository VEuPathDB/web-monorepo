// Enhance WDK's webpack config so we can share packages

var path = require('path');
var projectHome = process.env.PROJECT_HOME;
var wdkRoot = path.join(projectHome, 'WDK/View');

// Get Wdk's webpack.config.
var config = require(path.join(wdkRoot, 'webpack.config'));

// Make sure properties are initialized on config, without overwriting values.
initializeProps(config, 'resolveLoader');
initializeProps(config, 'externals', []);

// This lets us use build tools Wdk has already loaded.
config.resolveLoader.fallback = path.join(wdkRoot, 'node_modules');

// Map external libraries Wdk exposes so we can do things like:
//
//    import Wdk from 'wdk;
//    import React from 'react';
//
// This will give us more flexibility in changing how we load libraries
// without having to rewrite a bunch of application code.
config.externals.push({
  wdk            : 'Wdk',
  react          : 'React',
  'react-router' : 'ReactRouter',
  immutable      : 'Immutable',
  _: '_'
});

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

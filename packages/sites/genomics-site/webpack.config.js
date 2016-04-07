// Enhance WDK's webpack config so we can share packages

var path = require('path');
var projectHome = process.env.PROJECT_HOME;
var wdkRoot = path.join(projectHome, 'WDK/View');

// Get Wdk's webpack.config.
var config = require(path.join(wdkRoot, 'webpack.config'));

// clear wdk entry config and code splitting
config.entry = null;
config.output = null;
config.plugins.pop();

// Make sure properties are initialized on config, without overwriting values.
initializeProps(config, 'resolve.alias', {});
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
  'wdk'            : 'wdk',
  'react'          : 'React',
  'react-dom'      : 'ReactDOM',
  'react-router'   : 'ReactRouter',
  'immutable'      : 'Immutable',
  'lodash'         : '_'
}, resolveWdkClientExternal);

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

// See http://localhost:8080/plasmodb/app/record/dataset/DS_20c45d8ed1
var wdkClientRe = /^wdk-client(\/(.*))?/;
function resolveWdkClientExternal(context, request, callback) {
  var matches = wdkClientRe.exec(request);
  if (matches != null) {
    if (matches[2]) {
      return callback(null, 'var wdk.client.' + matches[2]);
    }
    else {
      return callback(null, 'var wdk.client');
    }
  }
  callback();
}

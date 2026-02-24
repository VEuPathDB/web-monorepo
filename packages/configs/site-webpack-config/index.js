var baseConfig = require('@veupathdb/base-webpack-config');

const CssCharsetPlugin = require('css-charset-webpack-plugin');

// Create webpack alias configuration object
var alias = {
  site: process.cwd() + '/webapp',
};

/**
 * Suppresses "No serializer registered for ProvidedDependency" cache warnings.
 * These arise because ify-loader processes node_modules files that also receive
 * a ProvidedDependency injection from ProvidePlugin (for process/browser).
 * Webpack's filesystem cache can't serialize ProvidedDependency in that context,
 * but the build and runtime behaviour are unaffected - only the cache entry for
 * those modules is skipped.
 */
class SuppressProvidedDependencyCacheWarnings {
  apply(compiler) {
    compiler.hooks.infrastructureLog.tap(
      'SuppressProvidedDependencyCacheWarnings',
      (origin, type, args) => {
        if (
          origin === 'webpack.cache.PackFileCacheStrategy' &&
          type === 'warn' &&
          args.length > 0 &&
          String(args[0]).includes('Skipped not serializable cache item')
        ) {
          return true; // returning true suppresses this log entry
        }
      }
    );
  }
}

module.exports = function configure(additionalConfig) {
  return baseConfig.merge([
    {
      context: process.cwd(),
      resolve: {
        alias,
        fallback: {
          fs: false,
          path: require.resolve('path-browserify'),
          stream: require.resolve('stream-browserify'),
          crypto: require.resolve('crypto-browserify'),
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          os: require.resolve('os-browserify/browser'),
        },
      },

      module: {
        rules: [
          {
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: [/node_modules/, /vendored/],
            enforce: 'pre',
            use: 'source-map-loader',
          },
          {
            test: /\.(js|jsx|ts|tsx)$/,
            include: /node_modules/,
            loader: 'ify-loader',
          },
        ],
      },

      plugins: [
        new baseConfig.webpack.ProvidePlugin({
          process: 'process/browser',
        }),
        new SuppressProvidedDependencyCacheWarnings(),
        new CssCharsetPlugin({ charset: 'utf-8' }),
      ],

      // Map external libraries Wdk exposes so we can do things like:
      //
      //    import Wdk from 'wdk;
      //    import React from 'react';
      //
      // This will give us more flexibility in changing how we load libraries
      // without having to rewrite a bunch of application code.
      externals: [
        {
          jquery: 'jQuery', // import $ from 'jquery' => var $ = window.jQuery
        },
      ],
    },
    additionalConfig,
  ]);
};

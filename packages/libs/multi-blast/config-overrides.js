const webpack = require('webpack');

/*
 * The following gives preference to the project's root node_modules directory when loading modules and loaders.
 * This necessary when using modules that are symlinked into node_modules (e.g., using `yarn link` or `npm link`).
 * This should not have any impact on building npm artifacts, as it is only used by webpack.
 */
module.exports = function override(config, env) {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      fallback: {
        path: 'path-browserify',
        stream: 'stream-browserify',
        querystring: 'querystring-es3',
        assert: 'assert',
        buffer: 'buffer',
        fs: false,
      },
    },
    plugins: [
      ...config.plugins,
      new webpack.ProvidePlugin({
        // This is needed by shape2geohash, used by MapVEuMap
        process: 'process/browser',
      }),
    ],
    externals: [{ jquery: 'jQuery' }],
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules\/(?!(@veupathdb))/,
          enforce: 'pre',
          use: 'source-map-loader',
        },
      ],
    },
    snapshot: {
      managedPaths: [],
    },
  };
};

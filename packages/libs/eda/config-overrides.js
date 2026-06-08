const webpack = require('webpack');
const path = require('path');

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
        // The ify-loader is needed for some plotly features.
        // This also needs the bubleify packages installed as
        // a dev dependency.
        {
          test: /\.(js|jsx|ts|tsx)$/,
          include: /node_modules/,
          loader: 'ify-loader',
        },
        {
          test: /\.(tsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
      ],
    },
    snapshot: {
      managedPaths: [],
    },
  };
};

/*
 * Jest (test runner) config overrides, applied by react-app-rewired.
 *
 * Several modules in this package transitively import the d3 family of
 * packages (e.g. d3, d3-scale), which ship as untransformed ES modules.
 * CRA's default `transformIgnorePatterns` skips everything in node_modules,
 * so Jest chokes on the `export` syntax with "Unexpected token 'export'".
 *
 * react-app-rewired *concatenates* array overrides from package.json onto
 * CRA's defaults, so we can't relax the pattern there - the broad default
 * still matches. Instead we replace `transformIgnorePatterns` outright here,
 * using a negative lookahead so the d3 packages (and their deps) ARE
 * transformed while everything else in node_modules is still skipped.
 */
module.exports.jest = function (config) {
  config.transformIgnorePatterns = [
    '[/\\\\]node_modules[/\\\\](?!(?:d3|d3-[\\w-]+|internmap|delaunator|robust-predicates)[/\\\\]).+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$',
  ];
  return config;
};

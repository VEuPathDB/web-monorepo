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
      modules: [
        path.join(__dirname, 'node_modules'),
        ...(config.resolve?.modules || ['node_modules']),
      ],
      fallback: {
        "assert": require.resolve("assert/"),
        "buffer": require.resolve("buffer/"),
        "path": require.resolve("path-browserify"),
        "querystring": require.resolve("querystring-es3"),
        "fs": false,
        "stream": require.resolve("stream-browserify")
      },
    },
    resolveLoader: {
      ...config.resolveLoader,
      modules: [
        path.join(__dirname, 'node_modules'),
        ...(config.resolveLoader?.modules || ['node_modules']),
      ],
    },
    externals: [{ jquery: 'jQuery' }],
    module: {
      ...config.module,
      rules: [
        ...config.module?.rules,
        // The ify-loader is needed for some plotly features.
        // This also needs the bubleify packages installed as
        // a dev dependency.
        {
          test: /\.(js|jsx|ts|tsx)$/,
          include: /node_modules/,
          loader: 'ify-loader',
        },
      ],
    },
    stats: 'errors-warnings',
  };
}

module.exports = function override(config, env) {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      fallback: {
        assert: require.resolve('assert/'),
        buffer: require.resolve('buffer/'),
        path: require.resolve('path-browserify'),
        querystring: require.resolve('querystring-es3'),
        fs: false,
        stream: require.resolve('stream-browserify'),
      },
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
};

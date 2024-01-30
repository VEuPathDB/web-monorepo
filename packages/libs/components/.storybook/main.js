module.exports = {
  typescript: {
    check: true,
  },
  stories: ['../src/**/!(_)*.stories.tsx'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport/register',
    './redmine-addon/register.js',
  ],
  webpackFinal: async (config, { configType }) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.
    config.node = {
      ...config.node,
      fs: 'empty',
    };

    // to resolve storybook issue with react-leaflet v3
    config.module.rules.push({
      test: /\.(js|jsx)$/,
      loader: require.resolve('babel-loader'),
      options: {
        plugins: ['@babel/plugin-proposal-nullish-coalescing-operator'],
        presets: ['@babel/preset-env', '@babel/preset-react'],
      },
    });

    config.module.rules.push({
      test: require.resolve('tidytree'),
      use: [
        // TidyTree expects window.d3 to be available, so we shim it with this loader
        {
          loader: 'imports-loader',
          options: {
            imports: {
              syntax: 'namespace',
              moduleName: require.resolve('d3v5'),
              name: 'd3',
            },
          },
        },
        // TidyTree creates a global variable, so we convert it to a named export with this laoder
        {
          loader: 'exports-loader',
          options: {
            exports: 'TidyTree',
          },
        },
      ],
    });

    // Return the altered config
    return config;
  },
};

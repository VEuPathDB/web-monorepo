const { addD3Shimming } = require('../webpack-shimming');

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
  // babel: async (options) => {
  //   return {
  //     ...options,
  //     presets: [...options.presets, '@emotion/babel-preset-css-prop'],
  //     // See https://stackoverflow.com/questions/70406632/typescript-parameter-properties-not-working-with-storybook-rollup-in-developm
  //     plugins: options.plugins.filter(
  //       (x) =>
  //         !(typeof x === 'string' && x.includes('plugin-transform-classes'))
  //     ),
  //   };
  // },
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

    addD3Shimming(config.module.rules);

    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
    });

    // Return the altered config
    return config;
  },
};

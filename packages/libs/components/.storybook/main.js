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

    // Return the altered config
    return config;
  },
};

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
};

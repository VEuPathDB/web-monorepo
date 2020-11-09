module.exports = {
  typescript: {
    check: true
  },
  stories: [
    '../src/**/!(_)*.stories.tsx',
  ],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-viewport/register',
  ],
};

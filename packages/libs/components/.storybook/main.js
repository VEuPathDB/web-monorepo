module.exports = {
  stories: ['../src/**/*.stories.js', '../src/**/*.stories.tsx'],
  addons: [
    '@storybook/preset-typescript',
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-docs',
    '@storybook/addon-viewport/register',
  ],
};

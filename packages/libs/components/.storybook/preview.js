import '@storybook/addon-console';

// storybook v6 seems to have default margin so remove it - https://github.com/storybookjs/storybook/issues/12109
export const parameters = {
  controls: { expanded: true },
  layout: 'fullscreen',
};

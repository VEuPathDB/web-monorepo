import '@storybook/addon-console';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  docs: {
    inlineStories: true,
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

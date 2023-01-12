const path = require('path');
const toPath = (_path) => path.join(process.cwd(), _path);

module.exports = {
  typescript: {
    check: true,
  },
  stories: [
    "../src/stories/**/*.stories.mdx",
    "../src/stories/**/*.stories.@(js|jsx|ts|tsx)",
    "../src/stories/**/*.stories.(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  babel: async (options) => {
    return ({
      ...options,
      presets: [ ...options.presets, '@emotion/babel-preset-css-prop' ],
      // See https://stackoverflow.com/questions/70406632/typescript-parameter-properties-not-working-with-storybook-rollup-in-developm
      plugins: options.plugins.filter(x => !(typeof x === 'string' && x.includes('plugin-transform-classes'))),
    })
  },
  webpackFinal: async (config) => {
    const { mode: environment, plugins, module } = config;
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,

          /**
           * Map Emotion 10 libraries to Emotion 11 libraries.
           *
           * Otherwise Storybook fails to compile with "Module not found: Error: Can't resolve '@emotion/styled/base'", etc.
           * It wasn't necessary to do this until we imported React component using "@emotion/styled".
           * This issue is probably caused because Storybook uses Emotion 10 while we have Emotion 11.
           *
           * @see https://github.com/storybookjs/storybook/issues/13277#issuecomment-751747964
           */
          '@emotion/core': toPath('node_modules/@emotion/react'),
          '@emotion/styled': toPath('node_modules/@emotion/styled'),
          'emotion-theming': toPath('node_modules/@emotion/react'),
        },
      },
    };
  },
}

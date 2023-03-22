This project is a component library for plots, maps, and other visualization tools, used in VEuPathDB websites. It uses storybook as a dev environment.

## Dependencies

- [Node.js](https://nodejs.org)
- [yarn](https://yarnpkg.com/)

## Quick start

Clone this repo and run the following commands within the repo's directory:

    yarn install
    yarn storybook

## Storybook output for master

See https://veupathdb.github.io/web-components

## Troubleshooting

This section documents issues that may arise during development.

### "Can't resolve '\<module-name\>' ..."

This is likely due to a module attempting to use a node library. This can be resolved by modifying [./.storybook/main.js](). For example, if the module name is "path", you would make the following change:

```diff
    config.node = {
       ...config.node,
       fs: 'empty',
+      path: 'empty',
     }

```

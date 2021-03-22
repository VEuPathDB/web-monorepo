const path = require('path');

/*
 * The following gives preference to the project's root node_modules directory when loading modules and loaders.
 * This necessary when using modules that are symlinked into node_modules (e.g., using `yarn link` or `npm link`).
 * This should not have any impact on building npm artifacts, as it is only used by webpack.
 */
module.exports = function override(config, env) {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      modules: [ path.join(__dirname, 'node_modules'), ...(config.resolve.modules || ['node_modules']) ]
    },
    resolveLoader: {
      ...config.resolveLoader,
      modules: [ path.join(__dirname, 'node_modules'), ...(config.resolveLoader.modules || ['node_modules']) ]
    }
  }
}

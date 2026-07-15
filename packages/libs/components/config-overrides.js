const path = require('path');

/*
 * Give preference to the project's root node_modules directory when
 * loading modules and loaders (same rationale as the other packages'
 * config-overrides). The jest override is an identity function: it
 * exists so `veupathdb-react-scripts test` (react-app-rewired) can boot.
 */
module.exports = {
  webpack: function override(config, env) {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        modules: [
          path.join(__dirname, 'node_modules'),
          ...(config.resolve.modules || ['node_modules']),
        ],
      },
      resolveLoader: {
        ...config.resolveLoader,
        modules: [
          path.join(__dirname, 'node_modules'),
          ...(config.resolveLoader.modules || ['node_modules']),
        ],
      },
    };
  },
  jest: function override(config) {
    return config;
  },
};

const path = require('path');

/*
 * Give preference to the project's root node_modules directory when
 * loading modules and loaders (same rationale as the other packages'
 * config-overrides).
 *
 * The jest override lets CRA/Jest transform `latlon-geohash`, which
 * ships only an ESM build (`"type": "module"`, `export default`), by
 * excluding it from the default node_modules transform-ignore pattern.
 * react-app-rewired's rewireJestConfig only concatenates array config
 * from package.json's "jest" field onto CRA's defaults, so a plain
 * package.json override can't take precedence over the default
 * ignore-all-node_modules pattern; it has to be edited here instead.
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
    return {
      ...config,
      transformIgnorePatterns: config.transformIgnorePatterns
        .filter((pattern) => !pattern.includes('node_modules'))
        .concat(
          '[/\\\\]node_modules[/\\\\](?!latlon-geohash[/\\\\]).+\\.(js|jsx|mjs|cjs|ts|tsx)$'
        ),
    };
  },
};

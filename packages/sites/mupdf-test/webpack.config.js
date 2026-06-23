var webpack = require('webpack');
var configure = require('@veupathdb/site-webpack-config');

const additionalConfig = {
  entry: {
    'site-client': __dirname + '/webapp/js/index.tsx',
  },
  experiments: {
    asyncWebAssembly: true,
    topLevelAwait: true,
  },
  resolve: {
    // mupdf-wasm.js uses `process` as a global; the ProvidePlugin injects
    // require('process/browser') for it but resolves from deep inside
    // node_modules/mupdf/dist where the workspace-root `process` package
    // isn't found. The absolute alias guarantees resolution everywhere.
    alias: {
      'process/browser': require.resolve('process/browser'),
    },
    fallback: {
      // mupdf uses Node.js built-ins inside Node.js-only branches; suppress
      // polyfills for the ones that aren't handled by site-webpack-config.
      module: false,
      url: false,
    },
  },
  plugins: [
    // mupdf uses `node:fs`, `node:path` etc. (the `node:` URI prefix).
    // Webpack 5.84 doesn't handle that scheme; strip the prefix so the
    // existing resolve.fallback rules (fs:false, path:path-browserify) apply.
    new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
      resource.request = resource.request.replace(/^node:/, '');
    }),
  ],
};

module.exports = configure(additionalConfig);
module.exports.additionalConfig = additionalConfig;

var webpack = require('webpack');
var configure = require('@veupathdb/site-webpack-config');

const additionalConfig = {
  entry: {
    'site-client': __dirname + '/webapp/wdkCustomization/js/client/main.js',
  },
  // MuPDF.js (lazy-loaded on the AI-comment upload tab) ships WASM and references
  // `process` plus Node built-ins; these settings let webpack 5 bundle it for the
  // browser. Lifted from the validated spike (branch feature-test-mupdf / PR #1700).
  // webpack-merge deep-merges these into the base/site config (arrays concatenate,
  // objects merge), so nothing here clobbers the existing setup.
  experiments: {
    asyncWebAssembly: true,
    topLevelAwait: true,
  },
  module: {
    rules: [
      // Apply babel to react-leaflet code.
      // This can be removed when we upgrade to webpack@5.
      {
        test: /\.jsx?$/,
        include: /node_modules\/@?react-leaflet/,
        use: [
          { loader: 'babel-loader', options: { configFile: './.babelrc' } },
        ],
      },
    ],
  },
  resolve: {
    // alias 'ciena-*' entries to '/lib' directory since the default
    // entry is es6 code, which uglifyjs does not understand
    alias: {
      'ciena-dagre': 'ciena-dagre/lib',
      'ciena-graphlib': 'ciena-graphlib/lib',
      // mupdf-wasm.js uses `process` as a global; the ProvidePlugin injects
      // require('process/browser'), but resolution from deep inside
      // node_modules/mupdf/dist can miss the workspace-root package. The
      // absolute alias guarantees resolution everywhere.
      'process/browser': require.resolve('process/browser'),
    },
    fallback: {
      // mupdf references these Node built-ins only in Node-only code paths;
      // suppress the polyfills the base config doesn't already cover.
      module: false,
      url: false,
    },
  },
  plugins: [
    // mupdf imports `node:fs`, `node:path` etc. (the `node:` URI scheme).
    // Webpack 5.84 doesn't handle that scheme; strip the prefix so the existing
    // resolve.fallback rules (fs:false, path:path-browserify) apply.
    new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
      resource.request = resource.request.replace(/^node:/, '');
    }),
  ],
};

module.exports = configure(additionalConfig);
module.exports.additionalConfig = additionalConfig;

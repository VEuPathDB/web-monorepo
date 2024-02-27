var configure = require('@veupathdb/site-webpack-config');

var additionalConfig = {
  entry: {
    'site-client': __dirname + '/webapp/wdkCustomization/js/client/main.js',
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
      // Loaders needed for TidyTree
      {
        test: require.resolve('tidytree'),
        use: [
          // TidyTree expects window.d3 to be available, so we shim it with this loader
          {
            loader: 'imports-loader',
            options: {
              imports: {
                syntax: 'namespace',
                moduleName: require.resolve('d3'),
                name: 'd3',
              },
            },
          },
          // TidyTree creates a global variable, so we convert it to a named export with this laoder
          {
            loader: 'exports-loader',
            options: {
              exports: 'TidyTree',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      'ortho-client': __dirname + '/webapp/wdkCustomization/js/client',
      'ortho-images': __dirname + '/webapp/wdkCustomization/images',
    },
  },
};

module.exports = configure(additionalConfig);
module.exports.additionalConfig = additionalConfig;

var configure = require('@veupathdb/site-webpack-config');
const { addD3Shimming } = require('@veupathdb/components/webpack-shimming');

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
    ],
  },
  resolve: {
    alias: {
      'ortho-client': __dirname + '/webapp/wdkCustomization/js/client',
      'ortho-images': __dirname + '/webapp/wdkCustomization/images',
    },
  },
};

// shimming of a specific version of d3 for CRC's tidytree JS library
addD3Shimming(additionalConfig.module.rules);

module.exports = configure(additionalConfig);
module.exports.additionalConfig = additionalConfig;

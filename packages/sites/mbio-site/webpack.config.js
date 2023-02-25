var configure = require('@veupathdb/site-webpack-config');

var additionalConfig = {
  entry: {
    'site-client': './webapp/wdkCustomization/js/client/main.js'
  },
  module: {
    rules: [
      // Apply babel to react-leaflet code.
      // This can be removed when we upgrade to webpack@5.
      {
        test: /\.jsx?$/,
        include: /node_modules\/@?react-leaflet/,
        use: [
          { loader: 'babel-loader', options: { configFile: './.babelrc' } }
        ]
      },
    ],
  },
};

module.exports = configure(additionalConfig);
module.exports.additionalConfig = additionalConfig;

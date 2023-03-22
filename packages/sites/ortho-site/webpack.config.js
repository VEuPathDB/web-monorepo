var configure = require('@veupathdb/site-webpack-config');

var additionalConfig = {
  entry: {
    'site-client': __dirname + '/webapp/wdkCustomization/js/client/main.js'
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
  resolve: {
    alias: {
      'ortho-client': __dirname + '/webapp/wdkCustomization/js/client',
      'ortho-images': __dirname + '/webapp/wdkCustomization/images'
    }
  }
};

module.exports = configure(additionalConfig);
module.exports.additionalConfig = additionalConfig;

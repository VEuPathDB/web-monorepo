var configure = require('@veupathdb/site-webpack-config');

var additionalConfig = {
  entry: {
    'site-client': './webapp/wdkCustomization/js/client/main.js'
  }
};

module.exports = configure(additionalConfig);
module.exports.additionalConfig = additionalConfig;

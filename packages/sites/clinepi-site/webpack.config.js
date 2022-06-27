const configure = require('@veupathdb/site-webpack-config');

const additionalConfig = {
  entry: {
    'site-client': __dirname + '/webapp/js/client/main.js'
  }
};

module.exports = configure(additionalConfig);
module.exports.additionalConfig = additionalConfig;

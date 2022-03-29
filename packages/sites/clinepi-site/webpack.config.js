const configure = require('../../EbrcWebsiteCommon/Site/site.webpack.config.js');

const additionalConfig = {
  entry: {
    'site-client': __dirname + '/webapp/js/client/main.js'
  }
};

module.exports = configure(additionalConfig);
module.exports.additionalConfig = additionalConfig;

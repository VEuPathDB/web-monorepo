var configure = require('../../EbrcWebsiteCommon/Site/site.webpack.config');

module.exports = configure({
  entry: {
    'legacy': [
      './webapp/wdkCustomization/js/client/main.js',
      require.resolve('../../EbrcWebsiteCommon/Site/webapp/wdkCustomization/js/common.js')
    ],
    'client': './webapp/wdkCustomization/js/client/main.js'
  }
});

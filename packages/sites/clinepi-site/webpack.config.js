var configure = require('../../EbrcWebsiteCommon/Site/site.webpack.config');

module.exports = configure({
  entry: {
    legacy: [
      require.resolve('../../EbrcWebsiteCommon/Site/webapp/wdkCustomization/js/common.js'),
      __dirname + '/webapp/css/ClinEpiSite.css',
    ],
    client: [
      __dirname + '/webapp/js/client.js',
      __dirname + '/webapp/css/ClinEpiSite.css',
    ]
  }
})

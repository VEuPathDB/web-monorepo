var configure = require('../../EuPathSiteCommon/Site/site.webpack.config');

module.exports = configure({
  entry: {
    'legacy': require.resolve('../../EuPathSiteCommon/Site/webapp/wdkCustomization/js/common.js'),
    'client': './webapp/wdkCustomization/js/client.js'
  }
});

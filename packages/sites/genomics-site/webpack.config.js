var configure = require('../../EuPathSiteCommon/Site/site.webpack.config');

module.exports = configure({
  entry: {
    'apidb': __dirname + '/webapp/apidb.js',
    'apidb-client': __dirname + '/webapp/wdkCustomization/js/client/index.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].bundle.js'
  }
});

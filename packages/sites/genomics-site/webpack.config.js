var configure = require('../../EuPathSiteCommon/Site/site.webpack.config');

module.exports = configure({
  entry: {
    'site': __dirname + '/webapp/apidb.js',
    'client': __dirname + '/webapp/wdkCustomization/js/client/index.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: 'apidb-[name].bundle.js'
  }
});

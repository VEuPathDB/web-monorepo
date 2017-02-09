var configure = require('../../EuPathSiteCommon/Site/site.webpack.config');

module.exports = configure({
  entry: {
    'legacy': __dirname + '/webapp/apidb.js',
    'client': __dirname + '/webapp/wdkCustomization/js/client/index.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: 'site-[name].bundle.js'
  },
  resolve: {
    // alias 'ciena-*' entries to '/lib' directory since the default
    // entry is es6 code, which uglifyjs does not understand
    alias: {
      'ciena-dagre': 'ciena-dagre/lib',
      'ciena-graphlib': 'ciena-graphlib/lib'
    }
  }
});

var configure = require('../../EbrcWebsiteCommon/Site/site.webpack.config');

module.exports = configure({
  resolve: {
    alias: {
      Client: __dirname + '/webapp/js/client/'
    }
  },
  entry: {
    'site-legacy': __dirname + '/webapp/js/legacy/main.js',
    'site-client': __dirname + '/webapp/js/client/main.js'
  }
})

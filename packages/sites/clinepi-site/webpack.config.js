var configure = require('../../EbrcWebsiteCommon/Site/site.webpack.config');

module.exports = configure({
  entry: {
    'site-legacy': __dirname + '/webapp/js/legacy/main.js',
    'site-client': __dirname + '/webapp/js/client/main.js'
  }
})

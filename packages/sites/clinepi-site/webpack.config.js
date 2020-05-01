var configure = require('../../EbrcWebsiteCommon/Site/site.webpack.config');

module.exports = configure({
  entry: {
    'site-client': __dirname + '/webapp/js/client/main.js'
  }
})

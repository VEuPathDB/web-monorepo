var configure = require('../../EbrcWebsiteCommon/Site/site.webpack.config');

module.exports = configure({
  entry: {
    legacy: __dirname + '/webapp/js/legacy/main.js',
    client: __dirname + '/webapp/js/client/main.js'
  }
})

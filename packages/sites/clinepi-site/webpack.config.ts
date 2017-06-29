import configure from '../../EbrcWebsiteCommon/Site/site.webpack.config';

export default configure({
  entry: {
    'site-legacy': __dirname + '/webapp/js/legacy/main.js',
    'site-client': __dirname + '/webapp/js/client/main.js'
  }
})

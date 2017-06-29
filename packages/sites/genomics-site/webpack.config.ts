import configure from '../../EbrcWebsiteCommon/Site/site.webpack.config';

export default configure({
  entry: {
    'site-legacy': __dirname + '/webapp/js/main.js',
    'site-client': __dirname + '/webapp/wdkCustomization/js/client/main.js'
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

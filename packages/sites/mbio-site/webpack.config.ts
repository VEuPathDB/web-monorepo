import configure from '../../EbrcWebsiteCommon/Site/site.webpack.config';

export default configure({
  entry: {
    'site-legacy': [
      './webapp/wdkCustomization/js/client/main.js',
      require.resolve('../../EbrcWebsiteCommon/Site/webapp/wdkCustomization/js/common.js')
    ],
    'site-client': './webapp/wdkCustomization/js/client/main.js'
  }
});

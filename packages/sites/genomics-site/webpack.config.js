var configure = require('@veupathdb/site-webpack-config');

const additionalConfig = {
  entry: {
    'site-client': [
      // suuport for <pdbe-molstar> custom element
      './vendored/pdbe-molstar-light-3.0.0.css',
      './vendored/pdbe-molstar-component-3.0.0',
      __dirname + '/webapp/wdkCustomization/js/client/main.js',
    ],
  },
  resolve: {
    // alias 'ciena-*' entries to '/lib' directory since the default
    // entry is es6 code, which uglifyjs does not understand
    alias: {
      'ciena-dagre': 'ciena-dagre/lib',
      'ciena-graphlib': 'ciena-graphlib/lib'
    }
  }
};

module.exports = configure(additionalConfig);
module.exports.additionalConfig = additionalConfig;

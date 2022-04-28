var configure = require('@veupathdb/site-webpack-config');

const additionalConfig = {
  entry: {
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
};

module.exports = configure(additionalConfig);
module.exports.additionalConfig = additionalConfig;

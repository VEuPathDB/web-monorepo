import HtmlWebpackPlugin from 'html-webpack-plugin';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import {
  makeCommonProxyConfig,
  makeLegacyWebAppProxyConfig,
} from '@veupathdb/react-scripts/utils/proxy-reqs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { webpack } = await import('../../install/base.webpack.config.js');
const { default: configure } = await import('../../EbrcWebsiteCommon/Site/site.webpack.config.js');
const { additionalConfig } = await import('./webpack.config.js');

export default configure({
  ...additionalConfig,
  output: {
    publicPath: '/'
  },
  devServer: {
    https: true,
    open: true,
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.get('/', (req, res) => {
        if (process.env.ROOT_URL !== '/') {
          res.redirect(process.env.ROOT_URL);
        }
      });

      return middlewares;
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    historyApiFallback: {
      disableDotRule: true
    },
    proxy: {
      ...makeCommonProxyConfig({
        [process.env.WDK_SERVICE_ENDPOINT]: process.env.WDK_SERVICE_URL,
        [process.env.EDA_SERVICE_ENDPOINT]: process.env.EDA_SERVICE_URL,
        [process.env.DOCUMENTS_ENDPOINT]: process.env.DOCUMENTS_URL,
      }),
      [process.env.LEGACY_WEB_APP_ENDPOINT]: makeLegacyWebAppProxyConfig({
        endpoint: process.env.LEGACY_WEB_APP_ENDPOINT,
        target: process.env.LEGACY_WEB_APP_URL,
        rootClientUrl: process.env.ROOT_URL,
      })
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'window.__SITE_CONFIG__': JSON.stringify({
        rootElement: process.env.ROOT_ELEMENT,
        rootUrl: process.env.ROOT_URL,
        endpoint: process.env.WDK_SERVICE_ENDPOINT,
        projectId: process.env.PROJECT_ID,
        webAppUrl: process.env.LEGACY_WEB_APP_ENDPOINT,
        facebookUrl: process.env.FACEBOOK_URL,
        twitterUrl: process.env.TWITTER_URL,
        twitterUrl2: process.env.TWITTER_URL_2,
        youtubeUrl: process.env.YOUTUBE_URL,
        redditUrl: process.env.REDDIT_URL,
        vimeoUrl: process.env.VIMEO_URL,
        communitySite: process.env.COMMUNITY_SITE,
        useEda: Boolean(process.env.USE_EDA),
        edaExampleAnalysesAuthor: process.env.EDA_EXAMPLE_ANALYSES_AUTHOR,
        edaServiceUrl: process.env.EDA_SERVICE_ENDPOINT,
      })
    }),
    new HtmlWebpackPlugin({
      inject: 'head',
      template: 'index.local.html',
      favicon: `${__dirname}/webapp/images/ClinEpiDB/favicon.ico`
    })
  ]
});

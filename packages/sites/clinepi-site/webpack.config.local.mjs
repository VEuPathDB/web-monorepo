import HtmlWebpackPlugin from 'html-webpack-plugin';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

import {
  makeCommonDevServerConfig,
} from '@veupathdb/react-scripts/utils/dev-server-config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { default: configure } = await import('@veupathdb/site-webpack-config');
const { additionalConfig } = await import('./webpack.config.js');

export default configure({
  ...additionalConfig,
  ...makeCommonDevServerConfig({
    rootClientUrl: process.env.ROOT_URL,
    proxies: {
      [process.env.WDK_SERVICE_ENDPOINT]: process.env.WDK_SERVICE_URL,
      [process.env.SITE_SEARCH_SERVICE_ENDPOINT]: process.env.SITE_SEARCH_SERVICE_URL,
      [process.env.EDA_SERVICE_ENDPOINT]: process.env.EDA_SERVICE_URL,
      [process.env.USER_DATASETS_WORKSPACE_IMPORT_SERVICE_ENDPOINT]: process.env.USER_DATASETS_WORKSPACE_IMPORT_SERVICE_URL,
      [process.env.DOCUMENTS_ENDPOINT]: process.env.DOCUMENTS_URL,
    },
    legacyWebAppEndpoint: process.env.LEGACY_WEB_APP_ENDPOINT,
    legacyWebAppUrl: process.env.LEGACY_WEB_APP_URL,
  }),
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
        youtubeUrl: process.env.YOUTUBE_URL,
        communitySite: process.env.COMMUNITY_SITE,
        showUnreleasedData: process.env.SHOW_UNRELEASED_DATA === 'true',
        siteSearchServiceUrl: process.env.SITE_SEARCH_SERVICE_ENDPOINT,
        ...(
          process.env.EDA_ENABLED === 'true'
            ? {
                useEda: true,
                edaExampleAnalysesAuthor: process.env.EDA_EXAMPLE_ANALYSES_AUTHOR,
                edaServiceUrl: process.env.EDA_SERVICE_ENDPOINT,
                edaSingleAppMode: process.env.EDA_SINGLE_APP_MODE,
                edaEnableFullScreenApps: process.env.EDA_ENABLE_FULL_SCREEN_APPS,
              }
            : { useEda: false }
        ),
        useUserDatasetsWorkspace: process.env.USER_DATASETS_WORKSPACE_ENABLED === 'true',
        datasetImportUrl: process.env.USER_DATASETS_WORKSPACE_IMPORT_SERVICE_ENDPOINT,
      })
    }),
    new HtmlWebpackPlugin({
      inject: 'head',
      template: 'index.local.html',
      favicon: `${__dirname}/webapp/images/ClinEpiDB/favicon.ico`
    })
  ]
});

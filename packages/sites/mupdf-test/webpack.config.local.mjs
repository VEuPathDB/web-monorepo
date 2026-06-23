import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

import configure from '@veupathdb/site-webpack-config';
import { additionalConfig } from './webpack.config.js';

dotenvExpand(dotenv.config());

const __dirname = dirname(fileURLToPath(import.meta.url));

export default configure({
  ...additionalConfig,
  output: {
    publicPath: '/',
  },
  devServer: {
    open: true,
    historyApiFallback: { disableDotRule: true },
    client: {
      overlay: { errors: true, warnings: false },
    },
  },
  plugins: [
    ...(additionalConfig.plugins || []),
    new webpack.DefinePlugin({
      'process.env.ROOT_ELEMENT': JSON.stringify(process.env.ROOT_ELEMENT || '#root'),
    }),
    new HtmlWebpackPlugin({
      inject: 'body',
      template: `${__dirname}/index.local.html`,
    }),
  ],
});

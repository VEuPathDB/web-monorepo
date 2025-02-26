import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const { default: configure } = await import('@veupathdb/site-webpack-config');
const { additionalConfig } = await import('./webpack.config.js');

export default configure({
  ...additionalConfig,
  plugins: [
    new BundleAnalyzerPlugin()
  ]
});


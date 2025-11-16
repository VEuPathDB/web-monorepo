import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import UnusedWebpackPlugin from 'unused-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { default: configure } = await import('@veupathdb/site-webpack-config');
const { additionalConfig } = await import('./webpack.config.js');

export default configure({
  ...additionalConfig,
  plugins: [
    new UnusedWebpackPlugin({
      directories: [join(__dirname, 'webapp')],
      exclude: ['*.scss', '*.css', 'WEB-INF/**', 'META-INF/**'],
      root: __dirname,
      failOnUnused: false
    })
  ]
});

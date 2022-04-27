// Base webpack configuration that can be shared amongst packages.
//
// Provide the ability to bundle typescript and es-latest authored source code
// into es5 code. Also handles minification, when appropriate.
//
// Exports a function that can be called with more configuration options.
// Those options will be merged with `baseConfig`, and the result will be
// returned.

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const isModern = process.env.BROWSERSLIST_ENV === 'modern';
const outputSubDir = isModern ? 'modern' : 'legacy';
console.log('BROWSERSLIST_ENV:', process.env.BROWSERSLIST_ENV)

/**
 * Creates a configuration function that is used by webpack. Takes a
 * configuration object, or an array of configuration objects, and merges them
 * with the base configuration object provided by WDK.
 *
 * For details, see https://webpack.js.org/configuration/.
 *
 * @param {object|object[]} additionalConfig
 */
exports.merge = function merge(additionalConfig) {
  return function (env, argv) {
    const isDevelopment = argv.mode !== 'production';
    return webpackMerge.smart([{
      bail: true,
      context: process.cwd(),
      resolve: {
        extensions: [ ".js", ".jsx", ".ts", ".tsx" ],
      },
      output: {
        path: path.join(process.cwd(), 'dist', outputSubDir),
        filename: '[name].bundle.js',
        chunkFilename: '[id].bundle-[chunkhash].js',
        hashDigestLength: 20
      },
      module: {
        rules: [

          // handle typescript source. reads `tsconfig.json` in cwd
          {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: [
              { loader: 'babel-loader', options: { configFile: path.join(process.cwd(), '.babelrc') } },
              { loader: 'ts-loader', options: { configFile: path.join(process.cwd(), 'tsconfig.json'), logLevel: 'info' } }
            ]
          },

          // handle es source. reads `.babelrc` in cwd
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: [
              { loader: 'babel-loader', options: { configFile: path.join(process.cwd(), '.babelrc') } }
            ]
          },

          // consumes too much memory
          // {
          //   test: /\.js$/,
          //   enforce: 'pre',
          //   use: ['source-map-loader']
          // },

          {
            test: /\.scss$/,
            use: [
              { loader: MiniCssExtractPlugin.loader },
              { loader: 'css-loader', options: { sourceMap: true } },
              { loader: 'sass-loader', options: { sourceMap: true } }
            ]
          },

          {
            test: /\.css$/,
            use: [
              { loader: MiniCssExtractPlugin.loader },
              { loader: 'css-loader', options: { sourceMap: true } }
            ]
          },

          // inlines images as base64
          {
            test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
            loader: 'url-loader',
            options: { limit: 100000 }
          },

        ]
      },
      devtool: 'source-map',
      plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.LoaderOptionsPlugin({ debug: isDevelopment }),
        new webpack.DefinePlugin({
          __DEV__: JSON.stringify(isDevelopment),
          __OUTPUT_SUBDIR__: JSON.stringify(outputSubDir + '/'),
          __IS_LEGACY_BUNDLE__: JSON.stringify(!isModern)
        }),
        new MiniCssExtractPlugin({
          filename: '[name].bundle.css',
          chunkFilename: '[id].bundle-[chunkhash].css'
        })
      ],
      stats: {
        maxModules: Infinity,
        optimizationBailout: true,
        modules: false
      }
    }].concat(typeof additionalConfig === 'function' ? additionalConfig(env, argv) : additionalConfig));
  }
}

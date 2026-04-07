var baseConfig = require('@veupathdb/base-webpack-config');

/**
 * Prepends @charset "utf-8" to CSS assets, removing any existing @charset
 * declarations first.  Uses ConcatSource to preserve source-map data so that
 * SourceMapDevToolPlugin (stage 500) can extract accurate .css.map files.
 *
 * Runs at STAGE_ADDITIONS (-100), before source maps are extracted.
 *
 * (The third-party css-charset-webpack-plugin ran at STAGE_OPTIMIZE = 100 and
 *  replaced assets with RawSource, which destroyed source maps entirely.)
 */
class CssCharsetPlugin {
  constructor({ charset = 'utf-8' } = {}) {
    this.charset = charset;
  }
  apply(compiler) {
    const { Compilation } = compiler.webpack;
    compiler.hooks.thisCompilation.tap('CssCharsetPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'CssCharsetPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        () => {
          const { ConcatSource, RawSource, ReplaceSource } =
            compiler.webpack.sources;
          for (const asset of compilation.getAssets()) {
            if (!/\.css$/i.test(asset.name)) continue;
            const css = asset.source.source().toString();
            if (/^\s*@charset\s+["'][^"']+["'];/i.test(css)) continue;

            if (/@charset\s+["'][^"']+["'];?/i.test(css)) {
              // Strip embedded @charset declarations using ReplaceSource so the
              // source map is preserved (ReplaceSource adjusts mappings around
              // the removed ranges, unlike a full RawSource rewrite).
              const replaceSource = new ReplaceSource(asset.source);
              const charsetRe = /@charset\s+["'][^"']+["'];?/gi;
              let match;
              while ((match = charsetRe.exec(css)) !== null) {
                replaceSource.replace(
                  match.index,
                  match.index + match[0].length - 1,
                  ''
                );
              }
              compilation.updateAsset(
                asset.name,
                new ConcatSource(
                  new RawSource(`@charset "${this.charset}";\n\n`),
                  replaceSource
                )
              );
            } else {
              // Common case: just prepend, preserving the original source maps
              compilation.updateAsset(
                asset.name,
                new ConcatSource(
                  new RawSource(`@charset "${this.charset}";\n\n`),
                  asset.source
                )
              );
            }
          }
        }
      );
    });
  }
}

// Create webpack alias configuration object
var alias = {
  site: process.cwd() + '/webapp',
};

/**
 * Suppresses "No serializer registered for ProvidedDependency" cache warnings.
 * These arise because ify-loader processes node_modules files that also receive
 * a ProvidedDependency injection from ProvidePlugin (for process/browser).
 * Webpack's filesystem cache can't serialize ProvidedDependency in that context,
 * but the build and runtime behaviour are unaffected - only the cache entry for
 * those modules is skipped.
 */
class SuppressProvidedDependencyCacheWarnings {
  apply(compiler) {
    compiler.hooks.infrastructureLog.tap(
      'SuppressProvidedDependencyCacheWarnings',
      (origin, type, args) => {
        if (
          origin === 'webpack.cache.PackFileCacheStrategy' &&
          type === 'warn' &&
          args.length > 0 &&
          String(args[0]).includes('Skipped not serializable cache item')
        ) {
          return true; // returning true suppresses this log entry
        }
      }
    );
  }
}

module.exports = function configure(additionalConfig) {
  return baseConfig.merge([
    {
      context: process.cwd(),
      resolve: {
        alias,
        fallback: {
          fs: false,
          path: require.resolve('path-browserify'),
          stream: require.resolve('stream-browserify'),
          crypto: require.resolve('crypto-browserify'),
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          os: require.resolve('os-browserify/browser'),
        },
      },

      module: {
        rules: [
          {
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: [/node_modules/, /vendored/],
            enforce: 'pre',
            use: 'source-map-loader',
          },
          {
            test: /\.(js|jsx|ts|tsx)$/,
            include: /node_modules/,
            loader: 'ify-loader',
          },
        ],
      },

      plugins: [
        new baseConfig.webpack.ProvidePlugin({
          process: 'process/browser',
        }),
        new SuppressProvidedDependencyCacheWarnings(),
        new CssCharsetPlugin(),
      ],

      // Map external libraries Wdk exposes so we can do things like:
      //
      //    import Wdk from 'wdk;
      //    import React from 'react';
      //
      // This will give us more flexibility in changing how we load libraries
      // without having to rewrite a bunch of application code.
      externals: [
        {
          jquery: 'jQuery', // import $ from 'jquery' => var $ = window.jQuery
        },
      ],
    },
    additionalConfig,
  ]);
};

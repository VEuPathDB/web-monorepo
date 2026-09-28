import {
  makeCommonProxyConfig,
  makeLegacyWebAppProxyConfig,
} from './proxy-reqs.js';

export function makeCommonDevServerConfig({
  rootClientUrl,
  proxies,
  legacyWebAppEndpoint,
  legacyWebAppUrl,
}) {
  return {
    output: {
      publicPath: '/',
    },
    watchOptions: {
      // Increase timeout from the default 20, since our build scripts
      // frequently move files into the target dir in two phases. This
      // increase seems to avoid two successive rebuilds.
      aggregateTimeout: 600,
      ignored: ['**/node_modules', '**/packages/*/*/src'],
    },
    devServer: {
      // https: true,
      open: true,
      setupMiddlewares: (middlewares, devServer) => {
        devServer.app.get('/', (req, res) => {
          if (rootClientUrl !== '/') {
            res.redirect(rootClientUrl);
          }
        });

        // Log a timestamp after each build (initial and hot rebuilds), since
        // webpack-dev-server's default stats output doesn't include one.
        // webpack-dev-middleware prints its own stats summary from a
        // process.nextTick callback (see its setupHooks.js), so we defer
        // the same way to land after it instead of before.
        devServer.compiler.hooks.afterDone.tap('LogRebuildTimestamp', () => {
          process.nextTick(() => {
            console.log(`[${new Date().toLocaleTimeString()}] Build complete`);
          });
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
        disableDotRule: true,
      },
      proxy: {
        ...makeCommonProxyConfig(proxies),
        [legacyWebAppEndpoint]: makeLegacyWebAppProxyConfig({
          endpoint: legacyWebAppEndpoint,
          target: legacyWebAppUrl,
          rootClientUrl,
        }),
      },
    },
  };
}

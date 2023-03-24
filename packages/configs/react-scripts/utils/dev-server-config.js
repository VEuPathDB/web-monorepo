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
      ignored: '**/packages/*/*/src/**',
    },
    devServer: {
      https: true,
      open: true,
      setupMiddlewares: (middlewares, devServer) => {
        devServer.app.get('/', (req, res) => {
          if (rootClientUrl !== '/') {
            res.redirect(rootClientUrl);
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

const { createProxyMiddleware } = require('http-proxy-middleware');
const { endpoint, vdiServiceUrl } = require('./constants');

const requiredEnvVars = [
  'WDK_SERVICE_URL',
  'DATASET_IMPORT_SERVICE_URL',
  'VDI_SERVICE_URL',
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length) {
  console.error(
    new Error(
      `Required environment variables are not defined: ${missingVars.join(
        ', '
      )}.`
    )
  );
  process.exit(1);
}

module.exports = function (app) {
  app.use(
    endpoint,
    createProxyMiddleware({
      target: process.env.WDK_SERVICE_URL,
      pathRewrite: { [`^${endpoint}`]: '' },
      secure: false,
      changeOrigin: true,
      followRedirects: true,
      logLevel: 'debug',
      onProxyReq: addPrereleaseAuthCookieToProxyReq,
    })
  );
  app.use(
    vdiServiceUrl,
    createProxyMiddleware({
      target: process.env.VDI_SERVICE_URL,
      pathRewrite: { [`^${vdiServiceUrl}`]: '' },
      secure: false,
      changeOrigin: true,
      followRedirects: true,
      logLevel: 'debug',
      onProxyReq: addPrereleaseAuthCookieToProxyReq,
    })
  );
  app.use(
    '/dataset-import',
    createProxyMiddleware({
      target: process.env.DATASET_IMPORT_SERVICE_URL,
      pathRewrite: { '^/dataset-import': '' },
      secure: false,
      changeOrigin: true,
      followRedirects: true,
      logLevel: 'debug',
      onProxyReq: addPrereleaseAuthCookieToProxyReq,
    })
  );
};

function addPrereleaseAuthCookieToProxyReq(proxyReq) {
  if (proxyReq._isRedirect) return;
  const authCookie = `auth_tkt=${process.env.VEUPATHDB_AUTH_TKT}`;
  const cookieRaw = proxyReq.getHeader('cookie');
  const cookies =
    cookieRaw == null
      ? authCookie
      : Array.isArray(cookieRaw)
      ? [...cookieRaw, authCookie]
      : [cookieRaw, authCookie];
  proxyReq.setHeader('cookie', cookies);
}

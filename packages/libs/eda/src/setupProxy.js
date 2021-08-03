const { createProxyMiddleware } = require('http-proxy-middleware');
const { endpoint } = require('./constants');

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
      onProxyReq: addAuthCookie,
    })
  );
  app.use(
    '/eda-subsetting-service',
    createProxyMiddleware({
      target: process.env.EDA_SUBSETTING_SERVICE_URL,
      pathRewrite: { [`^/eda-subsetting-service`]: '' },
      secure: false,
      changeOrigin: true,
      followRedirects: true,
      logLevel: 'debug',
      onProxyReq: addAuthCookie,
    })
  );
  app.use(
    '/eda-data-service',
    createProxyMiddleware({
      target: process.env.EDA_DATA_SERVICE_URL,
      pathRewrite: { [`^/eda-data-service`]: '' },
      secure: false,
      changeOrigin: true,
      followRedirects: true,
      logLevel: 'debug',
      onProxyReq: addAuthCookie,
    })
  );
  app.use(
    '/dataset-access',
    createProxyMiddleware({
      target: process.env.DATASET_ACCESS_SERVICE_URL,
      pathRewrite: { [`^/dataset-access`]: '' },
      secure: false,
      changeOrigin: true,
      followRedirects: true,
      logLevel: 'debug',
      onProxyReq: addAuthCookie,
    })
  );
};

function addAuthCookie(proxyReq) {
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

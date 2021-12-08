const { createProxyMiddleware } = require('http-proxy-middleware');
const { endpoint } = require('./constants');

const { curry } = require('lodash/fp');

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
      onProxyReq: function (proxyReq) {
        addPrereleaseAuthCookieToProxyReq(proxyReq);
      },
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
      onProxyReq: addPrereleaseAuthCookieToProxyReq,
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
      onProxyReq: addPrereleaseAuthCookieToProxyReq,
    })
  );
  app.use(
    '/eda-user-service',
    createProxyMiddleware({
      target: process.env.EDA_USER_SERVICE_URL,
      pathRewrite: { [`^/eda-user-service`]: '' },
      secure: false,
      changeOrigin: true,
      followRedirects: true,
      logLevel: 'debug',
      onProxyReq: addPrereleaseAuthCookieToProxyReq,
    })
  );
  app.use(
    '/eda-dataset-access',
    createProxyMiddleware({
      target: process.env.DATASET_ACCESS_SERVICE_URL,
      pathRewrite: { [`^/eda-dataset-access`]: '' },
      secure: false,
      changeOrigin: true,
      followRedirects: true,
      logLevel: 'debug',
      onProxyReq: addPrereleaseAuthCookieToProxyReq,
    })
  );
};

const addCookieToProxyReq = curry(function (
  cookieKey,
  processEnvKey,
  proxyReq
) {
  if (proxyReq._isRedirect) return;

  const cookieRaw = proxyReq.getHeader('cookie');

  const cookies = addCookieToRawStr(
    cookieRaw,
    cookieKey,
    process.env[processEnvKey]
  );

  if (cookies != null) {
    proxyReq.setHeader('cookie', cookies);
  }
});

const addPrereleaseAuthCookieToProxyReq = addCookieToProxyReq(
  'auth_tkt',
  'VEUPATHDB_AUTH_TKT'
);

function addCookieToRawStr(cookieRaw, newKey, newValue) {
  if (newValue == null) {
    return cookieRaw;
  }

  const cookies = rawCookieHeaderValueToArray(cookieRaw);

  return [
    ...cookies.filter((cookie) => !cookie.startsWith(`${newKey}=`)),
    `${newKey}=${newValue}`,
  ];
}

function rawCookieHeaderValueToArray(rawCookieHeaderValue) {
  return rawCookieHeaderValue == null
    ? []
    : Array.isArray(rawCookieHeaderValue)
    ? rawCookieHeaderValue
    : [rawCookieHeaderValue];
}

const { createProxyMiddleware } = require('http-proxy-middleware');
const { wdkEndpoint, edaEndpoint } = require('./constants');

const { curry } = require('lodash/fp');

module.exports = function (app) {
  app.use(
    wdkEndpoint,
    createProxyMiddleware({
      target: process.env.WDK_SERVICE_URL,
      pathRewrite: { [`^${wdkEndpoint}`]: '' },
      secure: false,
      changeOrigin: true,
      followRedirects: true,
      logLevel: 'debug',
      onProxyReq: addPrereleaseAuthCookieToProxyReq,
    })
  );
  app.use(
    edaEndpoint,
    createProxyMiddleware({
      target: process.env.BASE_EDA_URL,
      pathRewrite: { [`^${edaEndpoint}`]: '' },
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

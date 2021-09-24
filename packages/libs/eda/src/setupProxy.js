const { createProxyMiddleware } = require('http-proxy-middleware');
const { endpoint } = require('./constants');

const { curry } = require('lodash/fp');

// If a registered WDK user's auth key is not provided,
// we will persist the JSESSIONID used by the WDK service,
// so as to keep the (guest) WDK user stable while the
// dev server is running
const wdkCheckAuthProvided = process.env.WDK_CHECK_AUTH != null;

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

        if (wdkCheckAuthProvided) {
          addWdkCheckAuthCookieToProxyReq(proxyReq);
        } else {
          addJSessionIdCookieToProxyReq(proxyReq);
        }
      },
      onProxyRes: function (proxyRes) {
        if (wdkCheckAuthProvided) {
          addWdkCheckAuthCookieToProxyRes(proxyRes);
        } else {
          persistJSessionId(proxyRes);
        }
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
    '/dataset-access',
    createProxyMiddleware({
      target: process.env.DATASET_ACCESS_SERVICE_URL,
      pathRewrite: { [`^/dataset-access`]: '' },
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

const addJSessionIdCookieToProxyReq = addCookieToProxyReq(
  'JSESSIONID',
  'WDK_JSESSION_ID'
);

const addWdkCheckAuthCookieToProxyReq = addCookieToProxyReq(
  'wdk_check_auth',
  'WDK_CHECK_AUTH'
);

const addPrereleaseAuthCookieToProxyReq = addCookieToProxyReq(
  'auth_tkt',
  'VEUPATHDB_AUTH_TKT'
);

function persistJSessionId(proxyRes) {
  const setCookieRawHeaderValue = proxyRes.headers['set-cookie'];
  const setCookieHeaderValues = rawCookieHeaderValueToArray(
    setCookieRawHeaderValue
  );

  const jSessionIdHeaderValue = setCookieHeaderValues.find((cookie) =>
    cookie.startsWith('JSESSIONID=')
  );

  if (jSessionIdHeaderValue != null) {
    process.env.WDK_JSESSION_ID = jSessionIdHeaderValue
      .replace(/^JSESSIONID=/, '')
      .replace(/;.*/, '');
  }
}

function addWdkCheckAuthCookieToProxyRes(proxyRes) {
  const setCookieRawHeaderValue = proxyRes.headers['set-cookie'];

  const newSetCookies = addCookieToRawStr(
    setCookieRawHeaderValue,
    'wdk_check_auth',
    `${process.env.WDK_CHECK_AUTH}; path=/; expires=Session`
  );

  proxyRes.headers['set-cookie'] = newSetCookies;
}

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

const { createProxyMiddleware } = require('http-proxy-middleware');
const { endpoint } = require('./constants');

module.exports = function (app) {
  // Persist the JSESSIONID used by the WDK service,
  // so as to keep the WDK user stable while the dev server
  // is running
  let wdkJSessionIdRef = { current: undefined };

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
        addJSessionId(proxyReq, wdkJSessionIdRef);
        addAuthCookie(proxyReq);
      },
      onProxyRes: function (proxyReq) {
        persistJSessionId(proxyReq, wdkJSessionIdRef);
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
    '/eda-user-service',
    createProxyMiddleware({
      target: process.env.EDA_USER_SERVICE_URL,
      pathRewrite: { [`^/eda-user-service`]: '' },
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

function addJSessionId(proxyReq, wdkJSessionIdRef) {
  if (proxyReq._isRedirect) return;

  const cookieRaw = proxyReq.getHeader('cookie');

  const jSessionIdCookieValue = wdkJSessionIdRef.current;

  const cookies = addCookie(cookieRaw, 'JSESSIONID', jSessionIdCookieValue);

  proxyReq.setHeader('cookie', cookies);
}

function addAuthCookie(proxyReq) {
  if (proxyReq._isRedirect) return;
  const cookieRaw = proxyReq.getHeader('cookie');

  const authCookieValue = process.env.VEUPATHDB_AUTH_TKT;

  const cookies = addCookie(cookieRaw, 'auth_tkt', authCookieValue);

  proxyReq.setHeader('cookie', cookies);
}

function persistJSessionId(proxyRes, wdkJSessionIdRef) {
  const setCookieRawHeaderValue = proxyRes.headers['set-cookie'];
  const setCookieHeaderValues = rawCookieHeaderValueToArray(
    setCookieRawHeaderValue
  );

  const jSessionIdHeaderValue = setCookieHeaderValues.find((cookie) =>
    cookie.startsWith('JSESSIONID=')
  );

  if (jSessionIdHeaderValue != null) {
    wdkJSessionIdRef.current = jSessionIdHeaderValue
      .replace(/^JSESSIONID=/, '')
      .replace(/;.*/, '');
  }
}

function addCookie(cookieRaw, newKey, newValue) {
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

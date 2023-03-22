export function addCookieToProxyReq(
  cookieKey,
  processEnvKey
) {
  return function(proxyReq) {
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
  }
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

export const addPrereleaseAuthCookieToProxyReq = addCookieToProxyReq(
  'auth_tkt',
  'VEUPATHDB_AUTH_TKT'
);

export function makeCommonEndpointProxy({ endpoint, target }) {
  return {
    target,
    pathRewrite: { [`^${endpoint}`]: '' },
    secure: false,
    changeOrigin: true,
    followRedirects: true,
    logLevel: 'debug',
    onProxyReq: function (proxyReq) {
      addPrereleaseAuthCookieToProxyReq(proxyReq);
    }
  };
}

export function makeCommonProxyConfig(targetMap) {
  const proxyConfigEntries = Object.entries(targetMap).map(
    ([endpoint, target]) => [
      endpoint,
      makeCommonEndpointProxy({
        endpoint,
        target
      })
    ]
  );

  return Object.fromEntries(proxyConfigEntries);
}

export function makeLegacyWebAppProxyConfig({
  endpoint,
  target,
  rootClientUrl
}) {
  return {
    ...makeCommonEndpointProxy({
      endpoint,
      target
    }),
    bypass: function (req, res, proxyOptions) {
      if (req.url.startsWith(rootClientUrl)) {
        return 'index.html';
      }
    },
  };
}

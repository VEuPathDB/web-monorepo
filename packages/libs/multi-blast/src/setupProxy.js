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
      onProxyReq(proxyReq, req, res) {
        if (proxyReq._isRedirect) return;
        addVEuPathAuthToProxyReq(proxyReq);
      },
    })
  );

  app.use(
    '/multi-blast',
    createProxyMiddleware({
      target: process.env.BLAST_SERVICE_URL,
      pathRewrite: { ['^/multi-blast']: '' },
      secure: false,
      changeOrigin: true,
      followRedirects: true,
      logLevel: 'debug',
      onProxyReq(proxyReq, req, res) {
        if (proxyReq._isRedirect) return;
        addVEuPathAuthToProxyReq(proxyReq);
      },
    })
  );
};

function addVEuPathAuthToProxyReq(proxyReq) {
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

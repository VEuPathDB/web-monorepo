const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/service',
    createProxyMiddleware({
      target: process.env.WDK_SERVICE_URL,
      pathRewrite: { "^/service": "" },
      secure: false,
      changeOrigin: true,
      followRedirects: true,
      headers: {
        'Cookie': `auth_tkt=${process.env.VEUPATHDB_AUTH_TKT}`
      },
      logLevel: 'debug',
    })
  );
};

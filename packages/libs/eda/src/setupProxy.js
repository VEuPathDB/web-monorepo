const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/service',
    createProxyMiddleware({
      target: process.env.WDK_SERVICE_URL,
      pathRewrite: { "^/service": "" },
      secure: false,
      changeOrigin: true,
      ws: true,
      xfwd: true,
      followRedirects: true,
      logLevel: 'debug'
    })
  );
};

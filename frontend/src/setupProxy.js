//imports package and allows forwarding of HTTP requests to another server
const { createProxyMiddleware } = require('http-proxy-middleware');

//avoids CORS errors
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};

//forwards frontend API requests to backend
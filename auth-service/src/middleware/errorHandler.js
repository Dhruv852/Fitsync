/**
 * Global error handler — catches unhandled errors and returns consistent JSON
 */
function errorHandler(err, req, res, next) {
  console.error('[Auth Service Error]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
  });
}

module.exports = errorHandler;

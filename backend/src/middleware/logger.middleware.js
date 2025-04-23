const logger = require('../config/logger.config');

/**
 * Middleware to log all incoming requests
 */
const requestLogger = (req, res, next) => {
  // Log request details
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    body: req.method !== 'GET' ? req.body : undefined,
    params: req.params,
    query: req.query,
  });

  // Track response time
  const start = Date.now();
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
};

module.exports = {
  requestLogger,
};
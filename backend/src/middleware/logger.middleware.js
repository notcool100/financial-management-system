const logger = require('../config/logger.config');

/**
 * Middleware to log all incoming requests
 */
const requestLogger = (req, res, next) => {
  // Log request details
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    contentType: req.headers['content-type'],
    authorization: req.headers['authorization'] ? 'Present' : 'Missing',
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    params: req.params,
    query: req.query,
  });

  // Track response time
  const start = Date.now();
  
  // Store the original response methods
  const originalJson = res.json;
  const originalSend = res.send;
  
  // Override response methods to log the response body
  res.json = function(body) {
    res.responseBody = body;
    return originalJson.call(this, body);
  };
  
  res.send = function(body) {
    res.responseBody = body;
    return originalSend.call(this, body);
  };
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      statusCode: res.statusCode,
      duration,
      responseHeaders: res.getHeaders ? res.getHeaders() : {},
      responseBody: res.responseBody ? 
        (typeof res.responseBody === 'string' ? res.responseBody : JSON.stringify(res.responseBody)) 
        : undefined
    });
  });

  next();
};

module.exports = {
  requestLogger,
};
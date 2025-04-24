const logger = require('../config/logger.config');

/**
 * Custom error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`, { 
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  });

  // Set default status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized access';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden access';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.code === '23505') {
    // PostgreSQL unique violation error
    statusCode = 409;
    message = 'Duplicate entry found';
  } else if (err.type === 'entity.parse.failed') {
    // JSON parse error
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  // Make sure we're setting the correct content type
  res.setHeader('Content-Type', 'application/json');
  
  // Create the error response object
  const errorResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };
  
  // Log the error response we're sending
  logger.debug('Sending error response:', errorResponse);
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found error handler - for undefined routes
 */
const notFound = (req, res, next) => {
  const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound,
  ApiError,
};
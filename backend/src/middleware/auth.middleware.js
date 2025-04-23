const jwt = require('jsonwebtoken');
const { db } = require('../config/db.config');
const logger = require('../config/logger.config');

/**
 * Middleware to authenticate JWT tokens
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await db.oneOrNone('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please login again.' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
};

/**
 * Middleware to check if user has staff role
 */
const isStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Staff privileges required.' 
    });
  }
};

/**
 * Middleware to check if user is accessing their own data or has admin privileges
 */
const isOwnerOrAdmin = (req, res, next) => {
  if (
    req.user && 
    (req.user.role === 'admin' || req.user.id === req.params.id)
  ) {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. You can only access your own data.' 
    });
  }
};

module.exports = {
  authenticate,
  isAdmin,
  isStaff,
  isOwnerOrAdmin,
};
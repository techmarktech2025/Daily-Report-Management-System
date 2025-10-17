const jwt = require('jsonwebtoken');
const { User } = require('../models');
const asyncHandler = require('express-async-handler');
const { logger } = require('../config/db');

// Protect routes - authenticate user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ');
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route - No token provided'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No user found with this token'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('JWT verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route - Invalid token'
    });
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.warn(`Access denied for user ${req.user.username} (${req.user.role}) to restricted route`);
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check specific permissions
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (req.user.role === 'superadmin') {
      return next(); // Superadmin has all permissions
    }
    
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      logger.warn(`Permission denied for user ${req.user.username}: ${permission}`);
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions. Required: ${permission}`
      });
    }
    next();
  };
};

// Optional auth - doesn't fail if no token
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ');
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (user && user.is_active) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
      logger.warn('Optional auth failed:', error.message);
    }
  }

  next();
});

module.exports = {
  protect,
  authorize,
  checkPermission,
  optionalAuth
};

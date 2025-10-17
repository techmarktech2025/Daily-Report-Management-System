const { logger } = require('../config/db');
const fs = require('fs');
const path = require('path');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  logger.error('Error Handler:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.username : 'anonymous'
  });

  // Mongoose/Sequelize bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    return res.status(404).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(error => error.message).join(', ');
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: message
    });
  }

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    let message = 'Duplicate field value entered';
    let field = null;
    
    if (err.errors && err.errors) {
      field = err.errors.path;
      const fieldName = field.replace('_', ' ');
      message = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} already exists`;
    }
    
    return res.status(400).json({
      success: false,
      message,
      field,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Sequelize Foreign Key Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Cannot delete record due to existing references';
    return res.status(400).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Sequelize Database Connection Error
  if (err.name === 'SequelizeConnectionError') {
    const message = 'Database connection error';
    return res.status(500).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    return res.status(401).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    return res.status(401).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    return res.status(400).json({
      success: false,
      message,
      maxSize: process.env.MAX_FILE_SIZE || '10MB'
    });
  }

  // Handle operational vs programming errors
  const isProd = process.env.NODE_ENV === 'production';
  
  // Programming errors - don't leak details in production
  if (!err.isOperational && isProd) {
    logger.error('Programming Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    
    return res.status(500).json({
      success: false,
      message: 'Something went wrong on our end. Please try again later.',
      errorId: Date.now() // Reference ID for debugging
    });
  }

  // Default error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || err.message || 'Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: error
    }),
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
};

// Handle unhandled promise rejections
const handleUnhandledRejections = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection:', {
      reason: reason,
      promise: promise
    });
    
    // Close server & exit process gracefully
    console.log('Shutting down server due to unhandled promise rejection');
    process.exit(1);
  });
};

// Handle uncaught exceptions
const handleUncaughtExceptions = () => {
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    
    console.log('Shutting down server due to uncaught exception');
    process.exit(1);
  });
};

// Initialize error handlers
const initializeErrorHandlers = () => {
  handleUnhandledRejections();
  handleUncaughtExceptions();
};

module.exports = {
  errorHandler,
  initializeErrorHandlers
};

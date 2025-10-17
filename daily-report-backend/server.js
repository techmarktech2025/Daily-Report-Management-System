const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import database connection
const { connectDB, closeDB, logger } = require('./config/db');

// Import routes
const apiRoutes = require('./routes');

// Import middleware
const { errorHandler, initializeErrorHandlers } = require('./middleware/errorHandler');

// Import models to initialize associations
require('./models');

// Initialize error handlers early
initializeErrorHandlers();

// Initialize express app
const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Ensure log directory exists
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(compression());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl)
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (corsOrigins.indexOf(origin) !== -1 || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Body parsing middleware
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      const error = new Error('Invalid JSON');
      error.status = 400;
      throw error;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: parseInt(process.env.RATE_LIMIT_WINDOW) || 15
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and in development
    return req.path === '/api/health' || 
           req.path === '/api/' ||
           req.path === '/' ||
           process.env.NODE_ENV === 'development';
  }
});

app.use('/api/', limiter);

// Request logging middleware
app.use('/api/', (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.info('API Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    user: req.user ? req.user.username : 'anonymous'
  });
  
  // Log response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('API Response', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      user: req.user ? req.user.username : 'anonymous'
    });
  });
  
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Daily Report Management System API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api/',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// Handle 404 routes
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /',
      'GET /api/',
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/projects',
      'GET /api/employees',
      'GET /api/attendance',
      'GET /api/materials',
      'GET /api/tools',
      'GET /api/progress',
    //   'GET /api/dashboard'
    ]
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Close database connection
    await closeDB();
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Register graceful shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const PORT = process.env.PORT || 5050;

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    const server = app.listen(PORT, () => {
      console.log('='.repeat(80));
      console.log('🚀 DAILY REPORT MANAGEMENT SYSTEM API - PRODUCTION READY');
      console.log('='.repeat(80));
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🐬 Database: MySQL (${process.env.DB_NAME})`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}`);
      console.log(`📁 File Uploads: ${process.env.MAX_FILE_SIZE || '50MB'} max`);
      console.log(`⚡ Rate Limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${process.env.RATE_LIMIT_WINDOW || 15} minutes`);
      console.log('');
      console.log('🔗 Available Endpoints:');
      console.log(`   🏠 Root: http://localhost:${PORT}/`);
      console.log(`   🏥 Health: http://localhost:${PORT}/api/health`);
      console.log(`   📋 API Info: http://localhost:${PORT}/api/`);
      console.log('');
      console.log('🔐 Authentication:');
      console.log(`   📝 Register: POST /api/auth/register`);
      console.log(`   🔑 Login: POST /api/auth/login`);
      console.log(`   👤 Profile: GET /api/auth/me`);
      console.log('');
      console.log('📊 Main Endpoints:');
      console.log(`   🏗️  Projects: /api/projects`);
      console.log(`   👷 Employees: /api/employees`);
      console.log(`   ⏰ Attendance: /api/attendance`);
      console.log(`   🧱 Materials: /api/materials`);
      console.log(`   🔧 Tools: /api/tools`);
      console.log(`   📈 Progress: /api/progress`);
    //   console.log(`   📊 Dashboard: /api/dashboard`);
      console.log('='.repeat(80));
      
      logger.info(`Server started successfully on port ${PORT}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
        console.error(`❌ Port ${PORT} is already in use. Please use a different port or stop the conflicting process.`);
      } else {
        logger.error('Server error:', error);
        console.error('❌ Server error:', error.message);
      }
      process.exit(1);
    });

    // Store server reference for graceful shutdown
    process.server = server;
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;

const { Sequelize } = require('sequelize');
const winston = require('winston');
require('dotenv').config();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/database.log' })
  ]
});

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'daily_report_system',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  dialect: 'mysql',
  logging: process.env.DB_LOGGING === 'true' ? (msg) => logger.info(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  dialectOptions: {
    charset: 'utf8mb4',
    timezone: '+05:30' // IST timezone
  },
  timezone: '+05:30'
};

logger.info('Database Configuration:', {
  host: config.host,
  port: config.port,
  database: config.database,
  username: config.username
});

// Create Sequelize instance
const sequelize = new Sequelize(config);

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('🐬 MySQL Database connected successfully');
    
    // Sync database in development (be careful in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false, force: false });
      logger.info('📋 Database tables synchronized');
    }
    
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    console.error('💡 Make sure MySQL is running and check your .env credentials');
    throw error;
  }
};

// Graceful shutdown
const closeDB = async () => {
  try {
    await sequelize.close();
    logger.info('🔒 Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
  }
};

module.exports = {
  sequelize,
  connectDB,
  closeDB,
  logger
};

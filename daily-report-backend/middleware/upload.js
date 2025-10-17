const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const dirs = ['uploads', 'uploads/documents', 'uploads/images', 'uploads/reports'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    
    // Determine folder based on file type or field name
    if (file.mimetype.startsWith('image/')) {
      folder += 'images/';
    } else if (file.mimetype.includes('pdf') || file.mimetype.includes('document')) {
      folder += 'documents/';
    } else {
      folder += 'documents/'; // Default to documents
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES 
    ? process.env.ALLOWED_FILE_TYPES.split(',')
    : ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];
    
  const fileExtension = path.extname(file.originalname).toLowerCase().slice(1);
  const mimeTypeMap = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };

  if (allowedTypes.includes(fileExtension) && 
      file.mimetype === mimeTypeMap[fileExtension]) {
    return cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Parse file size limit
const parseFileSize = (sizeStr) => {
  if (!sizeStr) return 10 * 1024 * 1024; // Default 10MB
  
  const units = { 'B': 1, 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024 };
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?$/i);
  
  if (!match) return 10 * 1024 * 1024;
  
  const value = parseFloat(match);
  const unit = (match || 'B').toUpperCase();
  
  return value * (units[unit] || 1);
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseFileSize(process.env.MAX_FILE_SIZE),
    files: 10 // Maximum 10 files per request
  },
  fileFilter: fileFilter
});

// Error handling middleware
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message;
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File too large. Maximum size: ${process.env.MAX_FILE_SIZE || '10MB'}`;
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum 10 files allowed';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field name';
        break;
      default:
        message = 'File upload error';
    }
    
    return res.status(400).json({
      success: false,
      message,
      error: error.message
    });
  }
  
  if (error.message.includes('File type not allowed')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return [upload.single(fieldName), handleMulterError];
};

// Middleware for multiple file upload
const uploadMultiple = (fieldName, maxCount = 5) => {
  return [upload.array(fieldName, maxCount), handleMulterError];
};

// Middleware for mixed file upload (multiple fields)
const uploadFields = (fields) => {
  return [upload.fields(fields), handleMulterError];
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleMulterError
};

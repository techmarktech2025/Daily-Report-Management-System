const { body, param, query } = require('express-validator');

// User validation rules
const userValidation = {
  register: [
    body('username')
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers and underscores'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
    body('name')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    
    body('role')
      .optional()
      .isIn(['superadmin', 'admin', 'supervisor'])
      .withMessage('Role must be either superadmin, admin, or supervisor'),
    
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number')
  ],
  
  login: [
    body('username')
      .notEmpty()
      .withMessage('Username or email is required'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  
  updateProfile: [
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number')
  ],
  
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
  ]
};

// Project validation rules
const projectValidation = {
  create: [
    body('name')
      .isLength({ min: 3, max: 200 })
      .withMessage('Project name must be between 3 and 200 characters'),
    
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    
    body('location')
      .isObject()
      .withMessage('Location must be an object')
      .custom((value) => {
        if (!value.address) {
          throw new Error('Location must have an address');
        }
        return true;
      }),
    
    body('client')
      .isObject()
      .withMessage('Client must be an object')
      .custom((value) => {
        if (!value.name) {
          throw new Error('Client must have a name');
        }
        return true;
      }),
    
    body('start_date')
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    
    body('end_date')
      .isISO8601()
      .withMessage('End date must be a valid date')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.start_date)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    
    body('estimated_budget')
      .optional()
      .isNumeric()
      .withMessage('Estimated budget must be a number'),
    
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High', 'Critical'])
      .withMessage('Priority must be Low, Medium, High, or Critical'),
    
    body('status')
      .optional()
      .isIn(['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'])
      .withMessage('Status must be Planning, Active, On Hold, Completed, or Cancelled')
  ],
  
  update: [
    // Same as create but all fields optional
    body('name')
      .optional()
      .isLength({ min: 3, max: 200 })
      .withMessage('Project name must be between 3 and 200 characters'),
    
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
    
    body('start_date')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    
    body('end_date')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date'),
    
    body('estimated_budget')
      .optional()
      .isNumeric()
      .withMessage('Estimated budget must be a number'),
    
    body('completion_percentage')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Completion percentage must be between 0 and 100')
  ]
};

// Employee validation rules
const employeeValidation = {
  create: [
    body('personal_info')
      .isObject()
      .withMessage('Personal info must be an object')
      .custom((value) => {
        if (!value.first_name || !value.last_name) {
          throw new Error('Personal info must include first_name and last_name');
        }
        return true;
      }),
    
    body('employment')
      .isObject()
      .withMessage('Employment info must be an object')
      .custom((value) => {
        if (!value.department || !value.designation) {
          throw new Error('Employment info must include department and designation');
        }
        return true;
      }),
    
    body('personal_info.email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    
    body('personal_info.phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),
    
    body('personal_info.date_of_birth')
      .optional()
      .isISO8601()
      .withMessage('Date of birth must be a valid date'),
    
    body('employment.joining_date')
      .optional()
      .isISO8601()
      .withMessage('Joining date must be a valid date'),
    
    body('employment.salary')
      .optional()
      .isNumeric()
      .withMessage('Salary must be a number'),
    
    body('performance_rating')
      .optional()
      .isFloat({ min: 1.0, max: 5.0 })
      .withMessage('Performance rating must be between 1.0 and 5.0')
  ]
};

// Request validation rules
const requestValidation = {
  material: [
    body('project_id')
      .isInt()
      .withMessage('Project ID is required and must be a number'),
    
    body('materials')
      .isArray({ min: 1 })
      .withMessage('At least one material is required'),
    
    body('required_date')
      .isISO8601()
      .withMessage('Required date must be a valid date')
      .custom((value) => {
        if (new Date(value) < new Date()) {
          throw new Error('Required date cannot be in the past');
        }
        return true;
      }),
    
    body('reason')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Reason must be between 10 and 1000 characters'),
    
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High', 'Critical'])
      .withMessage('Priority must be Low, Medium, High, or Critical')
  ],
  
  tool: [
    body('project_id')
      .isInt()
      .withMessage('Project ID is required and must be a number'),
    
    body('tools')
      .isArray({ min: 1 })
      .withMessage('At least one tool is required'),
    
    body('required_date')
      .isISO8601()
      .withMessage('Required date must be a valid date'),
    
    body('reason')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Reason must be between 10 and 1000 characters'),
    
    body('request_type')
      .isIn(['Purchase', 'Rent', 'Borrow'])
      .withMessage('Request type must be Purchase, Rent, or Borrow'),
    
    body('return_date')
      .optional()
      .isISO8601()
      .withMessage('Return date must be a valid date')
  ]
};

// Attendance validation rules
const attendanceValidation = {
  checkIn: [
    body('employee_id')
      .isInt()
      .withMessage('Employee ID is required and must be a number'),
    
    body('project_id')
      .isInt()
      .withMessage('Project ID is required and must be a number'),
    
    body('work_description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Work description must be less than 500 characters')
  ],
  
  checkOut: [
    body('employee_id')
      .isInt()
      .withMessage('Employee ID is required and must be a number'),
    
    body('work_description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Work description must be less than 500 characters')
  ]
};

// Progress report validation
const progressValidation = {
  create: [
    body('project_id')
      .isInt()
      .withMessage('Project ID is required and must be a number'),
    
    body('report_date')
      .isISO8601()
      .withMessage('Report date must be a valid date'),
    
    body('shift')
      .optional()
      .isIn(['Morning', 'Evening', 'Night', 'Full Day'])
      .withMessage('Shift must be Morning, Evening, Night, or Full Day'),
    
    body('overall_progress_percentage')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Progress percentage must be between 0 and 100'),
    
    body('weather_conditions')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Weather conditions must be less than 100 characters')
  ]
};

// Common parameter validation
const paramValidation = {
  id: [
    param('id')
      .isInt()
      .withMessage('ID must be a valid number')
  ]
};

// Common query validation
const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]
};

module.exports = {
  userValidation,
  projectValidation,
  employeeValidation,
  requestValidation,
  attendanceValidation,
  progressValidation,
  paramValidation,
  queryValidation
};

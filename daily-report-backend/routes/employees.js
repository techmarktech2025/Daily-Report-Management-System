const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getActiveEmployees,
  getEmployeesByDepartment
} = require('../controllers/employeeController');

const { protect, authorize } = require('../middleware/auth');

// Validation rules
const employeeValidation = [
  body('personal_info').isObject().withMessage('Personal info must be an object'),
  body('employment').isObject().withMessage('Employment info must be an object'),
  body('personal_info.first_name').isLength({ min: 2, max: 50 }).withMessage('First name is required'),
  body('personal_info.last_name').isLength({ min: 2, max: 50 }).withMessage('Last name is required'),
  body('personal_info.email').isEmail().withMessage('Valid email is required'),
  body('employment.department').isLength({ min: 2, max: 50 }).withMessage('Department is required'),
  body('employment.designation').isLength({ min: 2, max: 50 }).withMessage('Designation is required')
];

// Routes
router.get('/', protect, authorize('admin', 'superadmin'), getAllEmployees);
router.post('/', protect, authorize('admin', 'superadmin'), employeeValidation, createEmployee);
router.get('/active', protect, getActiveEmployees);
router.get('/department/:department', protect, getEmployeesByDepartment);
router.get('/:id', protect, getEmployeeById);
router.put('/:id', protect, authorize('admin', 'superadmin'), employeeValidation, updateEmployee);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteEmployee);

module.exports = router;

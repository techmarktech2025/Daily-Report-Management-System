const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getAllAttendance,
  checkIn,
  checkOut,
  getAttendanceById,
  approveAttendance,
  getTodaysAttendance,
  getAttendanceByEmployee,
  getAttendanceByProject
} = require('../controllers/attendanceController');

const { protect, authorize } = require('../middleware/auth');

// Validation rules
const checkInValidation = [
  body('employee_id').isInt().withMessage('Employee ID is required'),
  body('project_id').isInt().withMessage('Project ID is required'),
  body('location').optional().isObject().withMessage('Location must be an object'),
  body('work_description').optional().isLength({ max: 500 }).withMessage('Work description too long')
];

const checkOutValidation = [
  body('employee_id').isInt().withMessage('Employee ID is required'),
  body('location').optional().isObject().withMessage('Location must be an object'),
  body('work_description').optional().isLength({ max: 500 }).withMessage('Work description too long')
];

// Routes
router.get('/', protect, getAllAttendance);
router.post('/checkin', protect, checkInValidation, checkIn);
router.post('/checkout', protect, checkOutValidation, checkOut);
router.get('/today', protect, getTodaysAttendance);
router.get('/employee/:employee_id', protect, getAttendanceByEmployee);
router.get('/project/:project_id', protect, getAttendanceByProject);
router.get('/:id', protect, getAttendanceById);
router.put('/:id/approve', protect, authorize('admin', 'superadmin'), approveAttendance);

module.exports = router;

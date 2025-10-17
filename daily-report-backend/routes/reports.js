const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getProjectReports,
  getEmployeeReports,
  getMaterialReports,
  getAttendanceReports
} = require('../controllers/reportController');

const { protect, authorize } = require('../middleware/auth');

// Routes
router.get('/dashboard', protect, getDashboardStats);
router.get('/projects', protect, authorize('admin', 'superadmin'), getProjectReports);
router.get('/employees', protect, authorize('admin', 'superadmin'), getEmployeeReports);
router.get('/materials', protect, getMaterialReports);
router.get('/attendance', protect, getAttendanceReports);

module.exports = router;

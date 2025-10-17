const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getAllProgressReports,
  createProgressReport,
  getProgressReportById,
  updateProgressReport,
  approveProgressReport,
  getProgressReportsByProject,
  getProgressReportsByDate
} = require('../controllers/progressController');

const { protect, authorize } = require('../middleware/auth');

// Validation rules
const progressReportValidation = [
  body('project_id').isInt().withMessage('Project ID is required'),
  body('report_date').isISO8601().withMessage('Report date must be valid'),
  body('shift').isIn(['Morning', 'Evening', 'Night', 'Full Day']).withMessage('Invalid shift'),
  body('overall_progress_percentage').optional().isNumeric({ min: 0, max: 100 }).withMessage('Progress percentage must be between 0 and 100')
];

// Routes
router.get('/', protect, getAllProgressReports);
router.post('/', protect, progressReportValidation, createProgressReport);
router.get('/project/:project_id', protect, getProgressReportsByProject);
router.get('/date/:date', protect, getProgressReportsByDate);
router.get('/:id', protect, getProgressReportById);
router.put('/:id', protect, progressReportValidation, updateProgressReport);
router.put('/:id/approve', protect, authorize('admin', 'superadmin'), approveProgressReport);

module.exports = router;

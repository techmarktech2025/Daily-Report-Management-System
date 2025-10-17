const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getAllToolRequests,
  createToolRequest,
  getToolRequestById,
  updateToolRequest,
  approveToolRequest,
  rejectToolRequest,
  markAsReturned,
  getToolRequestsByProject
} = require('../controllers/toolController');

const { protect, authorize } = require('../middleware/auth');

// Validation rules
const toolRequestValidation = [
  body('project_id').isInt().withMessage('Project ID is required'),
  body('tools').isArray({ min: 1 }).withMessage('At least one tool is required'),
  body('required_date').isISO8601().withMessage('Required date must be valid'),
  body('reason').isLength({ min: 10, max: 1000 }).withMessage('Reason must be between 10 and 1000 characters'),
  body('request_type').isIn(['Purchase', 'Rent', 'Borrow']).withMessage('Invalid request type'),
  body('priority').isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority')
];

// Routes
router.get('/', protect, getAllToolRequests);
router.post('/', protect, toolRequestValidation, createToolRequest);
router.get('/project/:project_id', protect, getToolRequestsByProject);
router.get('/:id', protect, getToolRequestById);
router.put('/:id', protect, toolRequestValidation, updateToolRequest);
router.put('/:id/approve', protect, authorize('admin', 'superadmin'), approveToolRequest);
router.put('/:id/reject', protect, authorize('admin', 'superadmin'), rejectToolRequest);
router.put('/:id/return', protect, authorize('admin', 'superadmin'), markAsReturned);

module.exports = router;

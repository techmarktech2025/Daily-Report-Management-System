const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getAllMaterialRequests,
  createMaterialRequest,
  getMaterialRequestById,
  updateMaterialRequest,
  approveMaterialRequest,
  rejectMaterialRequest,
  markAsDelivered,
  getMaterialRequestsByProject
} = require('../controllers/materialController');

const { protect, authorize } = require('../middleware/auth');

// Validation rules
const materialRequestValidation = [
  body('project_id').isInt().withMessage('Project ID is required'),
  body('materials').isArray({ min: 1 }).withMessage('At least one material is required'),
  body('required_date').isISO8601().withMessage('Required date must be valid'),
  body('reason').isLength({ min: 10, max: 1000 }).withMessage('Reason must be between 10 and 1000 characters'),
  body('priority').isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority')
];

// Routes
router.get('/', protect, getAllMaterialRequests);
router.post('/', protect, materialRequestValidation, createMaterialRequest);
router.get('/project/:project_id', protect, getMaterialRequestsByProject);
router.get('/:id', protect, getMaterialRequestById);
router.put('/:id', protect, materialRequestValidation, updateMaterialRequest);
router.put('/:id/approve', protect, authorize('admin', 'superadmin'), approveMaterialRequest);
router.put('/:id/reject', protect, authorize('admin', 'superadmin'), rejectMaterialRequest);
router.put('/:id/deliver', protect, authorize('admin', 'superadmin'), markAsDelivered);

module.exports = router;

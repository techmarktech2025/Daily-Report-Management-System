const express = require('express');
const router = express.Router();

const {
  getAllProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getProjectDashboard
} = require('../controllers/projectController');

const { protect, authorize } = require('../middleware/auth');
const { projectValidation, paramValidation, queryValidation } = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Routes
router.get('/', queryValidation.pagination, getAllProjects);
router.post('/', authorize('admin', 'superadmin'), projectValidation.create, createProject);
router.get('/:id', paramValidation.id, getProjectById);
router.put('/:id', authorize('admin', 'superadmin'), paramValidation.id, projectValidation.update, updateProject);
router.delete('/:id', authorize('admin', 'superadmin'), paramValidation.id, deleteProject);
router.put('/:id/status', authorize('admin', 'superadmin'), paramValidation.id, updateProjectStatus);
router.get('/:id/dashboard', paramValidation.id, getProjectDashboard);

module.exports = router;

const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth');
const projectRoutes = require('./projects');
const employeeRoutes = require('./employees');
const attendanceRoutes = require('./attendance');
const materialRoutes = require('./materials');
const toolRoutes = require('./tools');
const progressRoutes = require('./progress');
// const assignmentRoutes = require('./assignments');
// const dashboardRoutes = require('./dashboard');

// API version and health check
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Daily Report Management System API v1.0',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      employees: '/api/employees',
      attendance: '/api/attendance',
      materials: '/api/materials',
      tools: '/api/tools',
      progress: '/api/progress',
    //   assignments: '/api/assignments',
    //   dashboard: '/api/dashboard'
    }
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/employees', employeeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/materials', materialRoutes);
router.use('/tools', toolRoutes);
router.use('/progress', progressRoutes);
// router.use('/assignments', assignmentRoutes);
// router.use('/dashboard', dashboardRoutes);

module.exports = router;

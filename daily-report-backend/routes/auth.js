const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  getAllUsers,
  updateUserStatus
} = require('../controllers/authController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');
const { userValidation, paramValidation } = require('../middleware/validation');

// Public routes
router.post('/register', userValidation.register, register);
router.post('/login', userValidation.login, login);
router.post('/refresh', refreshToken);

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, userValidation.updateProfile, updateProfile);
router.put('/change-password', protect, userValidation.changePassword, changePassword);
router.post('/logout', protect, logout);

// Admin routes
router.get('/users', protect, authorize('admin', 'superadmin'), getAllUsers);
router.put('/users/:id/status', protect, authorize('admin', 'superadmin'), paramValidation.id, updateUserStatus);

module.exports = router;

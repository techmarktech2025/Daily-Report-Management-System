const { User, Employee, SystemLog } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logger } = require('../config/db');
const asyncHandler = require('express-async-handler');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { username, email, password, name, role, employee_id, phone, permissions } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ username }, { email }]
    }
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: existingUser.username === username 
        ? 'Username already exists' 
        : 'Email already exists'
    });
  }

  // Set default permissions based on role
  let userPermissions = permissions || [];
  if (!permissions) {
    switch (role || 'supervisor') {
      case 'superadmin':
        userPermissions = ['all_projects', 'user_management', 'system_config', 'analytics', 'reports', 'employee_management'];
        break;
      case 'admin':
        userPermissions = ['project_management', 'employee_management', 'material_approval', 'tool_approval', 'attendance_management'];
        break;
      case 'supervisor':
        userPermissions = ['attendance_entry', 'material_request', 'tool_request', 'progress_report', 'employee_view'];
        break;
    }
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    name,
    role: role || 'supervisor',
    employee_id,
    phone,
    permissions: userPermissions
  });

  // Log system activity
  await SystemLog.create({
    user_id: user.id,
    action: 'USER_REGISTER',
    entity_type: 'User',
    entity_id: user.id,
    details: { username, role: user.role },
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });

  // Generate tokens
  const token = user.generateToken();
  const refreshToken = user.generateRefreshToken();

  logger.info(`User registered successfully: ${user.username} (${user.role})`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      employeeId: user.employee_id,
      permissions: user.permissions
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { username, password } = req.body;

  // Find user with password
  const user = await User.findOne({
    where: { 
      [Op.or]: [{ username }, { email: username }],
      is_active: true 
    },
    attributes: { include: ['password'] },
    include: [{
      model: Employee,
      as: 'employeeProfile',
      required: false
    }]
  });

  if (!user) {
    logger.warn(`Login attempt failed - user not found: ${username}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    logger.warn(`Login attempt failed - invalid password: ${username}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Update last login
  await user.update({ last_login: new Date() });

  // Log system activity
  await SystemLog.create({
    user_id: user.id,
    action: 'USER_LOGIN',
    entity_type: 'User',
    entity_id: user.id,
    details: { username: user.username, role: user.role },
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });

  // Generate tokens
  const token = user.generateToken();
  const refreshToken = user.generateRefreshToken();

  logger.info(`User logged in successfully: ${user.username} (${user.role})`);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      employeeId: user.employee_id,
      permissions: user.permissions,
      lastLogin: user.last_login,
      employeeProfile: user.employeeProfile
    }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
    include: [{
      model: Employee,
      as: 'employeeProfile',
      required: false
    }]
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, email } = req.body;
  
  const user = await User.findByPk(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if email is taken by another user
  if (email && email !== user.email) {
    const existingUser = await User.findOne({
      where: { 
        email,
        id: { [Op.ne]: user.id }
      }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
  }

  // Update user
  await user.update({
    name: name || user.name,
    phone: phone || user.phone,
    email: email || user.email
  });

  // Log system activity
  await SystemLog.create({
    user_id: user.id,
    action: 'PROFILE_UPDATE',
    entity_type: 'User',
    entity_id: user.id,
    details: { updated_fields: Object.keys(req.body) },
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findByPk(req.user.id, {
    attributes: { include: ['password'] }
  });

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  await user.update({ password: newPassword });

  // Log system activity
  await SystemLog.create({
    user_id: user.id,
    action: 'PASSWORD_CHANGE',
    entity_type: 'User',
    entity_id: user.id,
    details: {},
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });

  logger.info(`Password changed for user: ${user.username}`);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.tokenType !== 'refresh') {
      throw new Error('Invalid token type');
    }

    const user = await User.findByPk(decoded.id, {
      where: { is_active: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
    const newToken = user.generateToken();
    const newRefreshToken = user.generateRefreshToken();

    res.status(200).json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // Log system activity
  await SystemLog.create({
    user_id: req.user.id,
    action: 'USER_LOGOUT',
    entity_type: 'User',
    entity_id: req.user.id,
    details: {},
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });

  logger.info(`User logged out: ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private (Admin/SuperAdmin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search, active = 'true' } = req.query;
  const offset = (page - 1) * limit;

  let where = {};
  
  if (active !== 'all') {
    where.is_active = active === 'true';
  }
  
  if (role) {
    where.role = role;
  }
  
  if (search) {
    where[Op.or] = [
      { username: { [Op.like]: `%${search}%` } },
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { employee_id: { [Op.like]: `%${search}%` } }
    ];
  }

  const users = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    include: [{
      model: Employee,
      as: 'employeeProfile',
      required: false
    }],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: users.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: users.count,
      pages: Math.ceil(users.count / limit)
    }
  });
});

// @desc    Update user status
// @route   PUT /api/auth/users/:id/status
// @access  Private (Admin/SuperAdmin)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { is_active } = req.body;
  const userId = req.params.id;

  const user = await User.findByPk(userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent deactivating superadmin by non-superadmin
  if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Cannot modify superadmin user'
    });
  }

  await user.update({ is_active });

  // Log system activity
  await SystemLog.create({
    user_id: req.user.id,
    action: 'USER_STATUS_UPDATE',
    entity_type: 'User',
    entity_id: user.id,
    details: { 
      target_user: user.username,
      new_status: is_active 
    },
    ip_address: req.ip,
    user_agent: req.get('User-Agent')
  });

  res.status(200).json({
    success: true,
    message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
    data: user
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  getAllUsers,
  updateUserStatus
};

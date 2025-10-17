const { Project, User, ProjectAssignment, Employee, Attendance, MaterialRequest, ToolRequest, WorkProgress } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const asyncHandler = require('express-async-handler');
const { logger } = require('../config/db');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getAllProjects = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    priority, 
    search,
    created_by,
    overdue,
    active_only = 'true'
  } = req.query;
  
  const offset = (page - 1) * limit;
  let where = {};

  // Filter by active status
  if (active_only === 'true') {
    where.is_active = true;
  }

  // Role-based filtering
  if (req.user.role === 'supervisor') {
    // Supervisors can only see projects they're assigned to
    const assignments = await ProjectAssignment.findAll({
      where: { 
        supervisor_id: req.user.id,
        is_active: true 
      },
      attributes: ['project_id']
    });
    const projectIds = assignments.map(a => a.project_id);
    where.id = { [Op.in]: projectIds };
  }

  // Apply filters
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (created_by) where.created_by = created_by;
  
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { project_id: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }

  // Overdue filter
  if (overdue === 'true') {
    where.end_date = { [Op.lt]: new Date() };
    where.status = { [Op.notIn]: ['Completed', 'Cancelled'] };
  }

  const projects = await Project.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'username']
      }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']]
  });

  // Add computed fields
  const projectsWithStats = await Promise.all(
    projects.rows.map(async (project) => {
      const projectData = project.toJSON();
      
      // Get project statistics
      const [assignedEmployees, totalAttendance, pendingMaterialRequests, pendingToolRequests] = await Promise.all([
        ProjectAssignment.count({ where: { project_id: project.id, is_active: true } }),
        Attendance.count({ where: { project_id: project.id } }),
        MaterialRequest.count({ where: { project_id: project.id, status: 'Pending' } }),
        ToolRequest.count({ where: { project_id: project.id, status: 'Pending' } })
      ]);

      return {
        ...projectData,
        stats: {
          assignedEmployees,
          totalAttendance,
          pendingMaterialRequests,
          pendingToolRequests,
          daysRemaining: project.getDaysRemaining(),
          daysElapsed: project.getDaysElapsed(),
          isOverdue: project.isOverdue(),
          budgetUtilization: project.getBudgetUtilization()
        }
      };
    })
  );

  res.status(200).json({
    success: true,
    data: projectsWithStats,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: projects.count,
      pages: Math.ceil(projects.count / limit)
    }
  });
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin/SuperAdmin)
const createProject = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const projectData = {
    ...req.body,
    created_by: req.user.id
  };

  const project = await Project.create(projectData);

  logger.info(`Project created: ${project.name} by ${req.user.username}`);

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project
  });
});

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'username']
      }
    ]
  });

  if (!project || !project.is_active) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Check access permissions
  if (req.user.role === 'supervisor') {
    const assignment = await ProjectAssignment.findOne({
      where: {
        project_id: project.id,
        supervisor_id: req.user.id,
        is_active: true
      }
    });
    
    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this project'
      });
    }
  }

  // Get detailed project statistics
  const [
    assignments,
    recentAttendance,
    materialRequests,
    toolRequests,
    progressReports
  ] = await Promise.all([
    ProjectAssignment.findAll({
      where: { project_id: project.id, is_active: true },
      include: [
        { model: Employee, as: 'employee' },
        { model: User, as: 'supervisor', attributes: ['id', 'name'] }
      ]
    }),
    Attendance.findAll({
      where: { project_id: project.id },
      limit: 10,
      order: [['attendance_date', 'DESC']],
      include: [{ model: Employee, as: 'employee' }]
    }),
    MaterialRequest.findAll({
      where: { project_id: project.id },
      order: [['created_at', 'DESC']],
      limit: 5
    }),
    ToolRequest.findAll({
      where: { project_id: project.id },
      order: [['created_at', 'DESC']],
      limit: 5
    }),
    WorkProgress.findAll({
      where: { project_id: project.id },
      order: [['report_date', 'DESC']],
      limit: 5
    })
  ]);

  const projectData = project.toJSON();
  
  res.status(200).json({
    success: true,
    data: {
      ...projectData,
      assignments,
      recentAttendance,
      materialRequests,
      toolRequests,
      progressReports,
      stats: {
        daysRemaining: project.getDaysRemaining(),
        daysElapsed: project.getDaysElapsed(),
        isOverdue: project.isOverdue(),
        isDelayed: project.isDelayed(),
        budgetUtilization: project.getBudgetUtilization()
      }
    }
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin/SuperAdmin)
const updateProject = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const project = await Project.findByPk(req.params.id);
  
  if (!project || !project.is_active) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  await project.update(req.body);

  logger.info(`Project updated: ${project.name} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Project updated successfully',
    data: project
  });
});

// @desc    Delete project (soft delete)
// @route   DELETE /api/projects/:id
// @access  Private (Admin/SuperAdmin)
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  
  if (!project) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  await project.update({ is_active: false });

  logger.info(`Project deleted: ${project.name} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Project deleted successfully'
  });
});

// @desc    Update project status
// @route   PUT /api/projects/:id/status
// @access  Private (Admin/SuperAdmin)
const updateProjectStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value'
    });
  }

  const project = await Project.findByPk(req.params.id);
  
  if (!project || !project.is_active) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  await project.update({ status });

  logger.info(`Project status updated: ${project.name} to ${status} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Project status updated successfully',
    data: project
  });
});

// @desc    Get project dashboard data
// @route   GET /api/projects/:id/dashboard
// @access  Private
const getProjectDashboard = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  
  if (!project || !project.is_active) {
    return res.status(404).json({
      success: false,
      message: 'Project not found'
    });
  }

  // Get dashboard statistics
  const [
    totalEmployees,
    presentToday,
    totalMaterialRequests,
    pendingMaterialRequests,
    totalToolRequests,
    pendingToolRequests,
    totalProgressReports,
    recentProgressReports
  ] = await Promise.all([
    ProjectAssignment.count({ where: { project_id: project.id, is_active: true } }),
    Attendance.count({ 
      where: { 
        project_id: project.id, 
        attendance_date: new Date().toISOString().split('T'),
        status: 'Present'
      } 
    }),
    MaterialRequest.count({ where: { project_id: project.id } }),
    MaterialRequest.count({ where: { project_id: project.id, status: 'Pending' } }),
    ToolRequest.count({ where: { project_id: project.id } }),
    ToolRequest.count({ where: { project_id: project.id, status: 'Pending' } }),
    WorkProgress.count({ where: { project_id: project.id } }),
    WorkProgress.findAll({
      where: { project_id: project.id },
      order: [['report_date', 'DESC']],
      limit: 7
    })
  ]);

  res.status(200).json({
    success: true,
    data: {
      project: project.toJSON(),
      stats: {
        totalEmployees,
        presentToday,
        totalMaterialRequests,
        pendingMaterialRequests,
        totalToolRequests,
        pendingToolRequests,
        totalProgressReports,
        daysRemaining: project.getDaysRemaining(),
        daysElapsed: project.getDaysElapsed(),
        isOverdue: project.isOverdue(),
        budgetUtilization: project.getBudgetUtilization()
      },
      recentProgressReports
    }
  });
});

module.exports = {
  getAllProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getProjectDashboard
};
